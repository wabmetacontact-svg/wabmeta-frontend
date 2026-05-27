import{r as i,j as e,s as p,d as u}from"./index-CFbXLKfp.js";import{E as g}from"./eye-off-BFdDaqvy.js";import{E as h}from"./eye-E5hBZuk3.js";const b=i.forwardRef(({label:n,error:s,success:t,icon:a,rightIcon:o,type:d="text",className:c="",...m},x)=>{const[l,f]=i.useState(!1),r=d==="password";return e.jsxs("div",{className:"w-full",children:[n&&e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:n}),e.jsxs("div",{className:"relative",children:[a&&e.jsx("div",{className:"absolute left-4 top-1/2 -translate-y-1/2 text-gray-400",children:a}),e.jsx("input",{ref:x,type:r?l?"text":"password":d,className:`
              w-full px-4 py-3.5 
              ${a?"pl-12":""} 
              ${r||o?"pr-12":""}
              border rounded-xl 
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-offset-0
              ${s?"border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50":t?"border-green-300 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50":"border-gray-200 focus:border-primary-500 focus:ring-primary-500/20 hover:border-gray-300"}
              placeholder:text-gray-400
              ${c}
            `,...m}),r&&e.jsx("button",{type:"button",onClick:()=>f(!l),className:"absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors",children:l?e.jsx(g,{className:"w-5 h-5"}):e.jsx(h,{className:"w-5 h-5"})}),o&&!r&&e.jsx("div",{className:"absolute right-4 top-1/2 -translate-y-1/2",children:o})]}),s&&e.jsxs("p",{className:"mt-2 text-sm text-red-600 flex items-center",children:[e.jsx(p,{className:"w-4 h-4 mr-1"}),s]}),t&&!s&&e.jsxs("p",{className:"mt-2 text-sm text-green-600 flex items-center",children:[e.jsx(u,{className:"w-4 h-4 mr-1"}),t]})]})});b.displayName="Input";export{b as I};
