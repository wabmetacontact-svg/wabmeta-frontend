// src/pages/instagram/InstagramContent.tsx
// The connected account's posts, reels and active stories, with per-post comment
// automation. "Automated" badges come from real comment rules targeting that post.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, Heart, MessageCircle, Zap, X, Plus,
  RefreshCw, PlayCircle, Images, AlertCircle
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { instagram } from '../../services/api';
import PageLoader from '../../components/common/PageLoader';
import {
  ChannelHeader, GlassCard, INSTAGRAM_THEME as TH, primaryBtnStyle
} from '../../components/channel/channelUi';

interface Post {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
}

interface Story {
  id: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
}

interface Content {
  connected: boolean;
  account: { username?: string; name?: string; profilePicUrl?: string } | null;
  posts: Post[];
  stories: Story[];
}

const isReel = (p: Post) => p.media_type === 'VIDEO' || p.media_type === 'REELS';

const InstagramContent: React.FC = () => {
  const [content, setContent] = useState<Content | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [automatedPostIds, setAutomatedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'POSTS' | 'REELS'>('POSTS');

  // Composer state
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [keywords, setKeywords] = useState('');
  const [commentReply, setCommentReply] = useState('');
  const [dmMessage, setDmMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError(null);
    try {
      const [contentRes, rulesRes] = await Promise.all([
        instagram.getContent(),
        instagram.getCommentRules().catch(() => ({ data: { data: [] } })),
      ]);
      setContent(contentRes.data?.data ?? null);

      // A post is "automated" when a real comment rule targets its id.
      const rules: any[] = Array.isArray(rulesRes.data?.data) ? rulesRes.data.data : [];
      const ids = new Set<string>();
      rules.forEach((r) => (r.postIds || []).forEach((id: string) => ids.add(id)));
      setAutomatedPostIds(ids);
    } catch (err: any) {
      // Never claim a connection we could not verify.
      setContent(null);
      setLoadError(err?.response?.data?.message || 'Could not load your Instagram content.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(true);
    if (!loadError) toast.success('Synced latest content from Instagram');
  };

  const openComposer = (post: Post) => {
    setActivePost(post);
    setKeywords(''); setCommentReply(''); setDmMessage('');
  };

  const handleCreateRule = async () => {
    if (!activePost) return;
    if (!commentReply.trim() && !dmMessage.trim()) {
      toast.error('Add a public reply or a DM message.');
      return;
    }
    setSaving(true);
    try {
      await instagram.createCommentRule({
        name: `Post Auto-Reply: ${(activePost.caption || activePost.id).slice(0, 20)}`,
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        postIds: [activePost.id],
        action: commentReply.trim() && dmMessage.trim() ? 'reply_and_dm' : dmMessage.trim() ? 'dm' : 'reply',
        commentReply: commentReply.trim() || undefined,
        dmMessage: dmMessage.trim() || undefined,
      });
      toast.success('Comment automation attached to this post!');
      // Reflect the new rule on the grid straight away.
      setAutomatedPostIds((prev) => new Set(prev).add(activePost.id));
      setActivePost(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not create that rule.');
    } finally {
      setSaving(false);
    }
  };

  const allPosts = useMemo(() => content?.posts ?? [], [content]);
  const stories = content?.stories ?? [];
  const connected = content?.connected;

  const filteredPosts = useMemo(
    () => allPosts.filter((p) => (activeTab === 'REELS' ? isReel(p) : !isReel(p))),
    [allPosts, activeTab]
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      <ChannelHeader
        theme={TH}
        icon={Grid}
        title="Posts & Stories"
        subtitle="View your Instagram content and attach comment-to-DM rules to specific posts or reels."
        action={
          connected ? (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-bold shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Sync content
            </button>
          ) : undefined
        }
      />

      {loadError ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">{loadError}</p>
            <button onClick={() => load()} className="mt-2 text-xs font-bold text-red-700 underline">Try again</button>
          </div>
        </div>
      ) : !connected ? (
        <GlassCard className="text-center border-dashed py-16">
          <FaInstagram className="w-10 h-10 mx-auto mb-4" style={{ color: TH.accent }} />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Connect Instagram</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Link your Instagram Business account to see your posts and attach comment automations.
          </p>
          <Link to="/instagram/settings" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform" style={primaryBtnStyle(TH)}>
            <FaInstagram className="w-4 h-4" /> Connect now
          </Link>
        </GlassCard>
      ) : (
        <>
          {/* Active stories */}
          {stories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900">
                Active stories <span className="text-[10px] font-mono text-gray-400">({stories.length})</span>
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {stories.map((s) => (
                  <a key={s.id} href={s.permalink || '#'} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 group">
                    <div className="w-20 h-28 rounded-2xl overflow-hidden border-2 p-0.5 transition-transform group-hover:scale-105" style={{ borderColor: TH.accent }}>
                      {s.thumbnail_url || s.media_url ? (
                        <img src={s.thumbnail_url || s.media_url} alt="story" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-gray-100" />
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl w-fit shadow-sm">
            {(['POSTS', 'REELS'] as const).map((tab) => {
              const count = allPosts.filter((p) => (tab === 'REELS' ? isReel(p) : !isReel(p))).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab ? 'bg-pink-50 text-pink-700 shadow-sm border border-pink-100' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab === 'POSTS' ? 'Feed posts' : 'Reels'}
                  <span className="ml-1.5 text-[10px] font-mono text-gray-400">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {filteredPosts.length === 0 ? (
            <GlassCard className="text-center border-dashed py-16">
              <Grid className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-800 mb-1">No {activeTab === 'POSTS' ? 'feed posts' : 'reels'} found</p>
              <p className="text-xs text-gray-500">Publish content on Instagram to see it here and attach rules.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPosts.map((p) => {
                const hasRule = automatedPostIds.has(p.id);
                const thumb = p.thumbnail_url || p.media_url;
                return (
                  <div key={p.id} className="group relative rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-pink-300 hover:shadow-md transition-all">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={p.caption || 'post'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Grid className="w-8 h-8" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2 drop-shadow-md">
                        {isReel(p) && <PlayCircle className="w-5 h-5 text-white" />}
                        {p.media_type === 'CAROUSEL_ALBUM' && <Images className="w-5 h-5 text-white" />}
                      </div>

                      {hasRule && (
                        <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                          <Zap className="w-3 h-3" /> Automated
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <p className="text-[11px] text-gray-600 line-clamp-2 h-8 leading-snug mb-3">
                        {p.caption || <span className="text-gray-400 italic">No caption</span>}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2.5 text-gray-500">
                          <div className="flex items-center gap-1" title="Likes">
                            <Heart className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">{p.like_count ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Comments">
                            <MessageCircle className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">{p.comments_count ?? 0}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => openComposer(p)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                            hasRule
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-gray-200 hover:border-pink-200'
                          }`}
                          title={hasRule ? 'Automation attached — add another rule' : 'Attach automation rule'}
                          aria-label="Attach automation rule"
                        >
                          {hasRule ? <Zap className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Composer */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setActivePost(null)} />

          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4 min-w-0">
                {activePost.thumbnail_url || activePost.media_url ? (
                  <img src={activePost.thumbnail_url || activePost.media_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm border border-gray-100" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Grid className="w-5 h-5 text-gray-300" /></div>
                )}
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-gray-900">Target this post</h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">Attach a comment-to-DM auto-reply</p>
                </div>
              </div>
              <button onClick={() => setActivePost(null)} aria-label="Close" className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Trigger keywords <span className="font-normal text-gray-400">(comma separated, empty = all comments)</span>
                </label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="price, link, details"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-pink-300 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Public comment reply <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  value={commentReply}
                  onChange={(e) => setCommentReply(e.target.value)}
                  placeholder="Check your DM! 📩"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-pink-300 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Private DM message <span className="font-normal text-gray-400">(sent to their inbox)</span>
                </label>
                <textarea
                  value={dmMessage}
                  onChange={(e) => setDmMessage(e.target.value)}
                  rows={3}
                  placeholder="Hey! 👋 Here's the link you requested: https://example.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none resize-none focus:bg-white focus:border-pink-300 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => setActivePost(null)} className="px-5 py-2.5 text-xs font-bold text-gray-500 rounded-full hover:bg-gray-100 transition-colors">Cancel</button>
                <button onClick={handleCreateRule} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-full shadow-md disabled:opacity-50 transition-all hover:-translate-y-0.5" style={primaryBtnStyle(TH)}>
                  <Plus className="w-4 h-4" /> {saving ? 'Attaching rule...' : 'Save rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramContent;
