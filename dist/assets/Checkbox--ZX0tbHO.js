import{j as e,a as l}from"./index-DyaHKDbt.js";const m=({id:t,checked:r,onChange:i,label:a,error:s})=>e.jsxs("div",{children:[e.jsxs("label",{htmlFor:t,className:"flex items-start cursor-pointer group",children:[e.jsxs("div",{className:"relative shrink-0",children:[e.jsx("input",{type:"checkbox",id:t,checked:r,onChange:n=>i(n.target.checked),className:"sr-only"}),e.jsx("div",{className:`
              w-5 h-5 rounded-md border-2 transition-all duration-200
              flex items-center justify-center
              ${r?"bg-primary-500 border-primary-500":"border-gray-300 group-hover:border-primary-400"}
              ${s?"border-red-500":""}
            `,children:r&&e.jsx(l,{className:"w-3.5 h-3.5 text-white",strokeWidth:3})})]}),a&&e.jsx("span",{className:"ml-3 text-sm text-gray-600 leading-tight",children:a})]}),s&&e.jsx("p",{className:"mt-1 text-sm text-red-600",children:s})]});export{m as C};
