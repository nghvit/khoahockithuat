import{M as H,r as w,j as e}from"./index-BNImIJBZ.js";import{T as b,G as P}from"./index-Ce2_9GLb.js";const G={BASE_URL:"/",DEV:!1,MODE:"production",PROD:!0,SSR:!1};let T=null,$=0;const I=[void 0,void 0,void 0,G==null?void 0:G.VITE_GEMINI_API_KEY_4].filter(Boolean);function q(){if(!T){if(I.length===0)throw new Error("No GEMINI_API_KEY environment variables set.");const a=I[$];if(!a)throw new Error("API_KEY environment variable not set.");T=new P({apiKey:a})}return T}function M(){$=($+1)%I.length,T=null}async function B(a,s,i){for(let r=0;r<I.length;r++)try{return await q().models.generateContent({model:a,contents:s,config:i})}catch(n){console.warn(`API key ${$+1} failed:`,n),M()}throw new Error("All API keys failed. Please check your API keys and quota.")}const R={type:b.OBJECT,properties:{questionSets:{type:b.ARRAY,items:{type:b.OBJECT,properties:{category:{type:b.STRING,description:"Tên danh mục câu hỏi"},icon:{type:b.STRING,description:"Font Awesome icon class"},color:{type:b.STRING,description:"Tailwind color class"},questions:{type:b.ARRAY,items:{type:b.STRING},description:"Danh sách câu hỏi trong danh mục"}},required:["category","icon","color","questions"]}}},required:["questionSets"]},U=async(a,s,i,r)=>{let n="";if(i==="general")n=K(a,s);else if(i==="specific"&&r&&!Array.isArray(r))n=O(a,s,r);else if(i==="comparative"&&Array.isArray(r))n=Y(a,s,r);else throw new Error("Invalid question type or candidate data");try{const h=await B(H,n,{responseMimeType:"application/json",responseSchema:R,temperature:.3,topP:.8,topK:40});return JSON.parse(h.text).questionSets||[]}catch(h){throw console.error("Error generating interview questions:",h),h}},K=(a,s)=>`
Bạn là chuyên gia tuyển dụng với 15+ năm kinh nghiệm. Nhiệm vụ: Tạo câu hỏi phỏng vấn thông minh dựa trên dữ liệu thực tế.

**THÔNG TIN TUYỂN DỤNG:**
- Vị trí: ${s.jobPosition}
- Địa điểm: ${a.job.locationRequirement}
- Tổng ứng viên đã lọc: ${s.totalCandidates}
- Ngành nghề chính: ${s.industries.join(", ")}
- Cấp độ phổ biến: ${s.levels.join(", ")}

**ĐIỂM YẾU PHỔ BIẾN CỦA ỨNG VIÊN:**
${s.commonWeaknesses.length>0?s.commonWeaknesses.map((i,r)=>`${r+1}. ${i}`).join(`
`):"Không có dữ liệu đặc biệt"}

**KỸ NĂNG THIẾU PHỔ BIẾN:**
${s.skillGaps.length>0?s.skillGaps.map((i,r)=>`${r+1}. ${i}`).join(`
`):"Không có dữ liệu đặc biệt"}

**YÊU CẦU:**
1. Tạo 4-5 nhóm câu hỏi khác nhau
2. Mỗi nhóm 4-6 câu hỏi cụ thể, thực tế
3. Câu hỏi PHẢI dựa trên dữ liệu thực tế về điểm yếu và kỹ năng thiếu
4. Tránh câu hỏi chung chung, tập trung vào những vấn đề cụ thể từ việc lọc CV
5. Bao gồm cả câu hỏi kỹ thuật và soft skills
6. Câu hỏi phải phù hợp với vị trí ${s.jobPosition}

**NHÓM GỢI Ý:**
- Câu hỏi chuyên môn theo vị trí và ngành nghề
- Câu hỏi về những điểm yếu phổ biến đã phát hiện
- Câu hỏi đánh giá kỹ năng thiếu
- Câu hỏi tình huống thực tế
- Câu hỏi về cultural fit và growth mindset

Trả về JSON với format yêu cầu. Icon sử dụng Font Awesome classes, color sử dụng Tailwind classes.
`,O=(a,s,i)=>{var f,v,C,x,k;const r=((f=i.analysis)==null?void 0:f["Điểm mạnh CV"])||[],n=((v=i.analysis)==null?void 0:v["Điểm yếu CV"])||[],h=((C=i.analysis)==null?void 0:C["Chi tiết"])||[],g=[],l=[];return h.forEach(u=>{const N=parseFloat(u.Điểm.split("/")[0]),t=parseFloat(u.Điểm.split("/")[1]),o=N/t*100;o>=80?g.push(u["Tiêu chí"]):o<50&&l.push(u["Tiêu chí"])}),`
Bạn là chuyên gia tuyển dụng. Tạo câu hỏi phỏng vấn CỤ THỂ cho ứng viên này dựa trên phân tích CV chi tiết.

**THÔNG TIN VỊ TRÍ:**
- Vị trí: ${s.jobPosition}
- Địa điểm: ${a.job.locationRequirement}

**THÔNG TIN ỨNG VIÊN:**
- Tên: ${i.candidateName}
- Chức danh hiện tại: ${i.jobTitle}
- Ngành: ${i.industry}
- Cấp độ: ${i.experienceLevel}
- Điểm tổng: ${(x=i.analysis)==null?void 0:x["Tổng điểm"]}/100
- Hạng: ${(k=i.analysis)==null?void 0:k.Hạng}

**ĐIỂM MẠNH CỦA ỨNG VIÊN:**
${r.length>0?r.map((u,N)=>`${N+1}. ${u}`).join(`
`):"Chưa xác định"}

**ĐIỂM YẾU CỦA ỨNG VIÊN:**
${n.length>0?n.map((u,N)=>`${N+1}. ${u}`).join(`
`):"Chưa xác định"}

**LĨNH VỰC MẠNH (điểm >=80%):**
${g.length>0?g.join(", "):"Không có"}

**LĨNH VỰC YẾU (điểm <50%):**
${l.length>0?l.join(", "):"Không có"}

**YÊU CẦU:**
1. Tạo câu hỏi RIÊNG BIỆT cho ứng viên này, không phải template chung
2. Khai thác sâu vào điểm mạnh để xác nhận
3. Thách thức những điểm yếu để test khả năng
4. Câu hỏi phải cụ thể, có thể verify được qua câu trả lời
5. Bao gồm câu hỏi tình huống dựa trên background của ứng viên
6. Tập trung vào việc validate những gì đã thể hiện trong CV

**NHÓM CÂUHỎI GỢI Ý:**
- Xác nhận điểm mạnh và kinh nghiệm
- Thách thức điểm yếu đã phát hiện  
- Câu hỏi kỹ thuật theo chuyên môn
- Tình huống thực tế trong vai trò ${s.jobPosition}
- Câu hỏi về growth và learning ability

Mỗi nhóm 4-5 câu cụ thể. Trả về JSON format.
`},Y=(a,s,i)=>{const r=i.map(n=>{var h,g,l,f;return{name:n.candidateName,rank:(h=n.analysis)==null?void 0:h.Hạng,score:(g=n.analysis)==null?void 0:g["Tổng điểm"],title:n.jobTitle,level:n.experienceLevel,strengths:((l=n.analysis)==null?void 0:l["Điểm mạnh CV"])||[],weaknesses:((f=n.analysis)==null?void 0:f["Điểm yếu CV"])||[]}});return`
Bạn là chuyên gia tuyển dụng. Tạo câu hỏi để SO SÁNH và lựa chọn giữa các ứng viên tốt nhất.

**THÔNG TIN VỊ TRÍ:**
- Vị trí: ${s.jobPosition}
- Địa điểm: ${a.job.locationRequirement}

**ỨNG VIÊN CẦN SO SÁNH:**
${r.map((n,h)=>`
${h+1}. ${n.name}
   - Hạng: ${n.rank} (${n.score} điểm)
   - Vị trí: ${n.title}
   - Cấp độ: ${n.level}
   - Điểm mạnh: ${n.strengths.slice(0,3).join(", ")}
   - Điểm yếu: ${n.weaknesses.slice(0,2).join(", ")}
`).join(`
`)}

**MỤC TIÊU:**
Tạo câu hỏi giúp HR so sánh trực tiếp và chọn ứng viên phù hợp nhất cho vị trí ${s.jobPosition}.

**YÊU CẦU:**
1. Câu hỏi phải giúp phân biệt rõ ràng giữa các ứng viên
2. Tập trung vào những điểm khác biệt quan trọng
3. Câu hỏi tình huống để test khả năng xử lý thực tế
4. So sánh về technical skills, soft skills, cultural fit
5. Câu hỏi về motivation và commitment
6. Đánh giá potential và growth mindset

**NHÓM CÂUHỎI:**
- Câu hỏi phân biệt khả năng kỹ thuật
- So sánh kinh nghiệm và achievements
- Đánh giá leadership và teamwork
- Test problem-solving approach
- Cultural fit và long-term commitment
- Scenario-based questions

Mỗi nhóm 4-5 câu, thiết kế để so sánh trực tiếp. Trả về JSON format.
`},J=({analysisData:a,selectedCandidates:s=[],onClose:i})=>{const[r,n]=w.useState(!1),[h,g]=w.useState([]),[l,f]=w.useState("general"),[v,C]=w.useState(""),x=w.useMemo(()=>{const t=a.candidates.filter(c=>c.status==="SUCCESS"),o=[...new Set(t.map(c=>c.industry).filter(Boolean))],d=[...new Set(t.map(c=>c.experienceLevel).filter(Boolean))],p=t.filter(c=>{var m;return((m=c.analysis)==null?void 0:m.Hạng)==="A"}).slice(0,5),S=new Map;t.forEach(c=>{var m,y;(y=(m=c.analysis)==null?void 0:m["Điểm yếu CV"])==null||y.forEach(j=>{S.set(j,(S.get(j)||0)+1)})});const A=new Map;return t.forEach(c=>{var m,y;(y=(m=c.analysis)==null?void 0:m["Chi tiết"])==null||y.forEach(j=>{const V=parseFloat(j.Điểm.split("/")[0]),E=parseFloat(j.Điểm.split("/")[1]);V/E*100<50&&A.set(j["Tiêu chí"],(A.get(j["Tiêu chí"])||0)+1)})}),{jobPosition:a.job.position,totalCandidates:t.length,industries:o.slice(0,3),levels:d.slice(0,3),topCandidates:p,commonWeaknesses:Array.from(S.entries()).sort((c,m)=>m[1]-c[1]).slice(0,5).map(([c])=>c),skillGaps:Array.from(A.entries()).sort((c,m)=>m[1]-c[1]).slice(0,5).map(([c])=>c)}},[a]),k=async()=>{n(!0);try{let t=null;l==="specific"&&v?t=a.candidates.find(d=>d.id===v):l==="comparative"&&s.length>0&&(t=s);const o=await U(a,x,l,t);g(o)}catch(t){console.error("Error generating questions:",t),g(u())}finally{n(!1)}},u=()=>{const{jobPosition:t,industries:o,commonWeaknesses:d}=x;return[{category:"Câu hỏi chung về vị trí",icon:"fa-solid fa-briefcase",color:"text-blue-400",questions:[`Bạn hiểu như thế nào về vai trò ${t} trong tổ chức?`,`Những thách thức lớn nhất mà một ${t} thường gặp phải là gì?`,`Bạn có kinh nghiệm gì liên quan đến ${t}?`,"Tại sao bạn quan tâm đến vị trí này?","Điều gì làm bạn khác biệt so với các ứng viên khác?"]},{category:"Câu hỏi kỹ thuật theo ngành",icon:"fa-solid fa-cogs",color:"text-green-400",questions:o.length>0?[`Trong ngành ${o[0]}, xu hướng nào đang ảnh hưởng lớn nhất?`,"Bạn đã từng giải quyết vấn đề phức tạp nào trong công việc?","Mô tả một dự án thành công mà bạn đã tham gia.","Bạn cập nhật kiến thức chuyên môn bằng cách nào?"]:["Mô tả kinh nghiệm làm việc ấn tượng nhất của bạn.","Bạn xử lý áp lực công việc như thế nào?","Kỹ năng nào bạn muốn phát triển thêm?"]},{category:"Câu hỏi về điểm yếu phổ biến",icon:"fa-solid fa-exclamation-triangle",color:"text-orange-400",questions:d.length>0?[`Nhiều ứng viên có vấn đề về "${d[0]}". Bạn tự đánh giá thế nào?`,"Bạn đã khắc phục những thiếu sót trong CV như thế nào?","Điểm yếu lớn nhất của bạn là gì và bạn cải thiện ra sao?"]:["Điểm yếu lớn nhất của bạn là gì?","Bạn học hỏi từ thất bại như thế nào?","Kỹ năng nào bạn cần cải thiện?"]}]},N=a.candidates.filter(t=>t.status==="SUCCESS").sort((t,o)=>{var d,p;return(((d=o.analysis)==null?void 0:d["Tổng điểm"])||0)-(((p=t.analysis)==null?void 0:p["Tổng điểm"])||0)});return e.jsxs("div",{className:"bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto flex flex-col overflow-hidden h-[85vh]",children:[e.jsxs("div",{className:"p-6 border-b border-slate-800 shrink-0 relative",style:{background:"linear-gradient(135deg, #0f172a 0%, #0b1220 40%, #020617 100%)",transform:"translateZ(0)"},children:[e.jsx("div",{className:"absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"}),e.jsxs("div",{className:"flex items-center justify-between relative z-10",children:[e.jsxs("div",{children:[e.jsxs("h2",{className:"text-2xl font-bold text-white flex items-center gap-3",children:[e.jsx("i",{className:"fa-solid fa-wand-magic-sparkles text-purple-400"}),"Gợi ý Câu hỏi Phỏng vấn AI"]}),e.jsx("p",{className:"text-slate-400 mt-1 text-sm font-medium",children:"Tạo câu hỏi phỏng vấn thông minh dựa trên JD và dữ liệu lọc CV"})]}),i&&e.jsx("button",{onClick:i,className:"w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50",children:e.jsx("i",{className:"fa-solid fa-times text-lg"})})]})]}),e.jsxs("div",{className:"flex-1 flex flex-col lg:flex-row overflow-hidden",children:[e.jsxs("div",{className:"w-full lg:w-[45%] p-6 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-800/60 flex flex-col",children:[e.jsxs("div",{className:"space-y-4 mb-8",children:[e.jsxs("h3",{className:"text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2",children:[e.jsx("i",{className:"fa-solid fa-database text-cyan-500/80"}),"Tổng quan dữ liệu lọc CV"]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:"bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 hover:border-slate-700 transition-colors",children:[e.jsx("div",{className:"text-[10px] text-slate-500 font-bold uppercase mb-1",children:"Vị trí"}),e.jsx("div",{className:"text-sm text-slate-200 font-semibold truncate",children:x.jobPosition})]}),e.jsxs("div",{className:"bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 hover:border-slate-700 transition-colors",children:[e.jsx("div",{className:"text-[10px] text-slate-500 font-bold uppercase mb-1",children:"Số lượng CV"}),e.jsxs("div",{className:"text-sm text-white font-semibold flex items-center gap-2",children:[e.jsx("i",{className:"fa-solid fa-file-invoice text-blue-400/80"}),x.totalCandidates]})]}),e.jsxs("div",{className:"bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 hover:border-slate-700 transition-colors",children:[e.jsx("div",{className:"text-[10px] text-slate-500 font-bold uppercase mb-1",children:"Ứng viên hạng A"}),e.jsxs("div",{className:"text-sm text-emerald-400 font-bold flex items-center gap-2",children:[e.jsx("i",{className:"fa-solid fa-star"}),x.topCandidates.length]})]}),e.jsxs("div",{className:"bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 hover:border-slate-700 transition-colors",children:[e.jsx("div",{className:"text-[10px] text-slate-500 font-bold uppercase mb-1",children:"Ngành nghề"}),e.jsx("div",{className:"text-[11px] text-blue-300 font-medium truncate",children:x.industries[0]||"IT/Software"})]})]})]}),e.jsxs("div",{className:"space-y-4 mb-8",children:[e.jsx("h3",{className:"text-xs font-bold text-slate-500 uppercase tracking-widest",children:"Chọn loại câu hỏi:"}),e.jsx("div",{className:"space-y-3",children:[{id:"general",title:"Câu hỏi chung",desc:"Dựa trên JD và xu hướng ngành",icon:"fa-users",color:"purple"},{id:"specific",title:"Câu hỏi cụ thể",desc:"Dành cho 1 ứng viên cụ thể",icon:"fa-user-tag",color:"emerald"},{id:"comparative",title:"So sánh ứng viên",desc:"So sánh điểm mạnh giữa nhiều người",icon:"fa-scale-balanced",color:"orange"}].map(t=>e.jsxs("button",{onClick:()=>f(t.id),className:`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all group ${l===t.id?`border-${t.color}-500 bg-${t.color}-500/10 shadow-[0_0_20px_rgba(0,0,0,0.2)]`:"border-slate-800 bg-slate-900/40 hover:border-slate-600"}`,children:[e.jsx("div",{className:`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${l===t.id?`bg-${t.color}-500/20 border-${t.color}-500/30 text-${t.color}-400`:"bg-slate-800 border-slate-700 text-slate-500"}`,children:e.jsx("i",{className:`fa-solid ${t.icon} text-lg`})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("div",{className:`font-bold text-sm ${l===t.id?`text-${t.color}-400`:"text-slate-300"}`,children:t.title}),e.jsx("div",{className:"text-[11px] text-slate-500 truncate group-hover:text-slate-400",children:t.desc})]}),l===t.id&&e.jsx("div",{className:`ml-auto text-${t.color}-500`,children:e.jsx("i",{className:"fa-solid fa-circle-check"})})]},t.id))})]}),l==="specific"&&e.jsxs("div",{className:"mb-8 animate-in fade-in slide-in-from-top-2",children:[e.jsx("label",{className:"block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2",children:"Chọn ứng viên:"}),e.jsxs("select",{value:v,onChange:t=>C(t.target.value),className:"w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all",children:[e.jsx("option",{value:"",children:"-- Chọn ứng viên từ danh sách --"}),N.map(t=>{var o,d;return e.jsxs("option",{value:t.id,children:[t.candidateName," (Hạng ",(o=t.analysis)==null?void 0:o.Hạng," - ",(d=t.analysis)==null?void 0:d["Tổng điểm"],"đ)"]},t.id)})]})]}),l==="comparative"&&s.length>0&&e.jsxs("div",{className:"mb-8 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/20 animate-in fade-in slide-in-from-top-2",children:[e.jsx("h4",{className:"text-xs font-bold text-orange-400 uppercase tracking-widest mb-3",children:"Ứng viên đang so sánh:"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:s.map(t=>e.jsxs("div",{className:"bg-orange-950/40 text-orange-300 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-orange-900/40 flex items-center gap-2",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-orange-500"}),t.candidateName]},t.id))})]}),l==="comparative"&&s.length===0&&e.jsxs("div",{className:"mb-8 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 text-xs text-amber-300 italic",children:[e.jsx("i",{className:"fa-solid fa-circle-info mr-2"}),"Vui lòng chọn ứng viên ở bảng danh sách trước khi so sánh."]}),e.jsx("div",{className:"mt-auto pt-4",children:e.jsx("button",{onClick:k,disabled:r||l==="specific"&&!v||l==="comparative"&&s.length===0,className:"w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20 relative overflow-hidden",children:r?e.jsxs("div",{className:"flex items-center justify-center gap-3",children:[e.jsx("i",{className:"fa-solid fa-circle-notch fa-spin"}),e.jsx("span",{children:"Đang xử lý dữ liệu..."})]}):e.jsxs("div",{className:"flex items-center justify-center gap-2",children:[e.jsx("i",{className:"fa-solid fa-brain"}),e.jsx("span",{children:"Tạo câu hỏi phỏng vấn AI"})]})})})]}),e.jsxs("div",{className:"flex-1 bg-slate-950/30 p-6 overflow-y-auto custom-scrollbar flex flex-col",children:[e.jsxs("div",{className:"flex items-center justify-between mb-6",children:[e.jsxs("h3",{className:"text-lg font-bold text-white flex items-center gap-3",children:[e.jsx("i",{className:"fa-solid fa-list-check text-emerald-400"}),"Gợi ý từ AI"]}),h.length>0&&e.jsx("button",{onClick:()=>{const t=h.map(o=>`${o.category}:
${o.questions.map((d,p)=>`${p+1}. ${d}`).join(`
`)}`).join(`

`);navigator.clipboard.writeText(t)},className:"text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 transition-all",children:"Copy tất cả"})]}),r?e.jsxs("div",{className:"flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in",children:[e.jsx("div",{className:"w-16 h-16 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-slate-300 font-bold",children:"AI đang phân tích CV..."}),e.jsx("p",{className:"text-xs text-slate-500 mt-1",children:"Đang trích xuất nội dung và tạo câu hỏi tối ưu"})]})]}):h.length===0?e.jsxs("div",{className:"flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800/60 rounded-3xl opacity-50",children:[e.jsx("div",{className:"w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 text-slate-700",children:e.jsx("i",{className:"fa-solid fa-comment-nodes text-4xl"})}),e.jsx("h4",{className:"text-slate-300 font-bold mb-2",children:"Chưa có câu hỏi được tạo"}),e.jsx("p",{className:"text-sm text-slate-500 max-w-xs",children:'Nhấn "Tạo câu hỏi phỏng vấn" để AI trích xuất các câu hỏi phù hợp nhất cho ứng viên.'})]}):e.jsx("div",{className:"space-y-6 animate-in slide-in-from-right-4 duration-500",children:h.map((t,o)=>e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("i",{className:`${t.icon} ${t.color} text-sm`}),e.jsx("h4",{className:"text-xs font-bold text-slate-400 uppercase tracking-widest",children:t.category})]}),e.jsx("div",{className:"grid grid-cols-1 gap-3",children:t.questions.map((d,p)=>e.jsxs("div",{className:"group bg-slate-900/60 border border-slate-800/40 rounded-xl p-4 flex gap-4 hover:border-slate-700 hover:bg-slate-900/80 transition-all shadow-sm",children:[e.jsx("div",{className:`w-6 h-6 rounded-lg ${t.color.replace("text-","bg-").replace("400","500/20")} ${t.color} flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-current opacity-60`,children:p+1}),e.jsx("div",{className:"flex-1 min-w-0",children:e.jsx("p",{className:"text-sm text-slate-200 leading-relaxed font-medium",children:d})}),e.jsx("button",{onClick:()=>{navigator.clipboard.writeText(d)},className:"w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/50 text-slate-500 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 shrink-0",title:"Copy câu hỏi",children:e.jsx("i",{className:"fa-solid fa-copy text-xs"})})]},p))})]},o))})]})]})]})};export{J as I};
