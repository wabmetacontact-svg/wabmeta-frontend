import{r as o,j as e}from"./index-CiVJdec6.js";import{E as h}from"./eye-off-CDl0ONnl.js";import{E as f}from"./eye-Dm31-E-_.js";const w=o.forwardRef(({label:l,error:t,icon:s,type:n="text",helperText:d,className:x="",...i},m)=>{const[a,p]=o.useState(!1),[c,u]=o.useState(!1),r=n==="password",b=r?a?"text":"password":n;return e.jsxs("div",{className:"w-full",children:[l&&e.jsxs("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:[l,i.required&&e.jsx("span",{className:"text-red-400 ml-1",children:"*"})]}),e.jsxs("div",{className:"relative group",children:[e.jsx("div",{className:`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
            ${c?"opacity-100 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-md":"opacity-0"}`}),s&&e.jsx("div",{className:`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300
              ${t?"text-red-400":c?"text-green-400":"text-gray-500"}`,children:s}),e.jsx("input",{ref:m,type:b,onFocus:()=>u(!0),onBlur:()=>u(!1),className:`
              relative w-full
              ${s?"pl-12":"pl-4"} 
              ${r?"pr-12":"pr-4"} 
              py-3.5 
              bg-white/[0.04] backdrop-blur-xl
              border rounded-xl 
              text-white placeholder:text-gray-500
              transition-all duration-300
              focus:outline-none focus:bg-white/[0.06]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${t?"border-red-400/40 focus:border-red-400/60":"border-white/[0.08] focus:border-green-400/40 hover:border-white/[0.15]"}
              ${x}
            `,...i}),r&&e.jsx("button",{type:"button",onClick:()=>p(!a),className:`absolute right-4 top-1/2 -translate-y-1/2 z-10
                text-gray-500 hover:text-white transition-colors
                p-1 rounded-lg hover:bg-white/[0.05]`,tabIndex:-1,children:a?e.jsx(h,{className:"w-4 h-4"}):e.jsx(f,{className:"w-4 h-4"})})]}),t&&e.jsxs("p",{className:"mt-2 text-xs text-red-400 flex items-center gap-1.5 animate-fadeIn",children:[e.jsx("span",{className:"w-1 h-1 rounded-full bg-red-400"}),t]}),d&&!t&&e.jsx("p",{className:"mt-2 text-xs text-gray-500",children:d})]})});w.displayName="Input";export{w as I};
