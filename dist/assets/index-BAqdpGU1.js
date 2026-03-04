import{M as V,r as C,j as e}from"./index-Defu2eV-.js";import{T as v,G as q}from"./index-Ce2_9GLb.js";const G={BASE_URL:"/",DEV:!1,MODE:"production",PROD:!0,SSR:!1};let w=null,$=0;const I=[void 0,void 0,void 0,G==null?void 0:G.VITE_GEMINI_API_KEY_4].filter(Boolean);function P(){if(!w){if(I.length===0)throw new Error("No GEMINI_API_KEY environment variables set.");const r=I[$];if(!r)throw new Error("API_KEY environment variable not set.");w=new q({apiKey:r})}return w}function M(){$=($+1)%I.length,w=null}async function B(r,s,i){for(let a=0;a<I.length;a++)try{return await P().models.generateContent({model:r,contents:s,config:i})}catch(t){console.warn(`API key ${$+1} failed:`,t),M()}throw new Error("All API keys failed. Please check your API keys and quota.")}const R={type:v.OBJECT,properties:{questionSets:{type:v.ARRAY,items:{type:v.OBJECT,properties:{category:{type:v.STRING,description:"Tên danh mục câu hỏi"},icon:{type:v.STRING,description:"Font Awesome icon class"},color:{type:v.STRING,description:"Tailwind color class"},questions:{type:v.ARRAY,items:{type:v.STRING},description:"Danh sách câu hỏi trong danh mục"}},required:["category","icon","color","questions"]}}},required:["questionSets"]},U=async(r,s,i,a)=>{let t="";if(i==="general")t=K(r,s);else if(i==="specific"&&a&&!Array.isArray(a))t=O(r,s,a);else if(i==="comparative"&&Array.isArray(a))t=Y(r,s,a);else throw new Error("Invalid question type or candidate data");try{const h=await B(V,t,{responseMimeType:"application/json",responseSchema:R,temperature:.3,topP:.8,topK:40});return JSON.parse(h.text).questionSets||[]}catch(h){throw console.error("Error generating interview questions:",h),h}},K=(r,s)=>`
Bạn là chuyên gia tuyển dụng với 15+ năm kinh nghiệm. Nhiệm vụ: Tạo câu hỏi phỏng vấn thông minh dựa trên dữ liệu thực tế.

**THÔNG TIN TUYỂN DỤNG:**
- Vị trí: ${s.jobPosition}
- Địa điểm: ${r.job.locationRequirement}
- Tổng ứng viên đã lọc: ${s.totalCandidates}
- Ngành nghề chính: ${s.industries.join(", ")}
- Cấp độ phổ biến: ${s.levels.join(", ")}

**ĐIỂM YẾU PHỔ BIẾN CỦA ỨNG VIÊN:**
${s.commonWeaknesses.length>0?s.commonWeaknesses.map((i,a)=>`${a+1}. ${i}`).join(`
`):"Không có dữ liệu đặc biệt"}

**KỸ NĂNG THIẾU PHỔ BIẾN:**
${s.skillGaps.length>0?s.skillGaps.map((i,a)=>`${a+1}. ${i}`).join(`
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
`,O=(r,s,i)=>{var x,N,T,u,k;const a=((x=i.analysis)==null?void 0:x["Điểm mạnh CV"])||[],t=((N=i.analysis)==null?void 0:N["Điểm yếu CV"])||[],h=((T=i.analysis)==null?void 0:T["Chi tiết"])||[],g=[],d=[];return h.forEach(p=>{const f=parseFloat(p.Điểm.split("/")[0]),n=parseFloat(p.Điểm.split("/")[1]),o=f/n*100;o>=80?g.push(p["Tiêu chí"]):o<50&&d.push(p["Tiêu chí"])}),`
Bạn là chuyên gia tuyển dụng. Tạo câu hỏi phỏng vấn CỤ THỂ cho ứng viên này dựa trên phân tích CV chi tiết.

**THÔNG TIN VỊ TRÍ:**
- Vị trí: ${s.jobPosition}
- Địa điểm: ${r.job.locationRequirement}

**THÔNG TIN ỨNG VIÊN:**
- Tên: ${i.candidateName}
- Chức danh hiện tại: ${i.jobTitle}
- Ngành: ${i.industry}
- Cấp độ: ${i.experienceLevel}
- Điểm tổng: ${(u=i.analysis)==null?void 0:u["Tổng điểm"]}/100
- Hạng: ${(k=i.analysis)==null?void 0:k.Hạng}

**ĐIỂM MẠNH CỦA ỨNG VIÊN:**
${a.length>0?a.map((p,f)=>`${f+1}. ${p}`).join(`
`):"Chưa xác định"}

**ĐIỂM YẾU CỦA ỨNG VIÊN:**
${t.length>0?t.map((p,f)=>`${f+1}. ${p}`).join(`
`):"Chưa xác định"}

**LĨNH VỰC MẠNH (điểm >=80%):**
${g.length>0?g.join(", "):"Không có"}

**LĨNH VỰC YẾU (điểm <50%):**
${d.length>0?d.join(", "):"Không có"}

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
`},Y=(r,s,i)=>{const a=i.map(t=>{var h,g,d,x;return{name:t.candidateName,rank:(h=t.analysis)==null?void 0:h.Hạng,score:(g=t.analysis)==null?void 0:g["Tổng điểm"],title:t.jobTitle,level:t.experienceLevel,strengths:((d=t.analysis)==null?void 0:d["Điểm mạnh CV"])||[],weaknesses:((x=t.analysis)==null?void 0:x["Điểm yếu CV"])||[]}});return`
Bạn là chuyên gia tuyển dụng. Tạo câu hỏi để SO SÁNH và lựa chọn giữa các ứng viên tốt nhất.

**THÔNG TIN VỊ TRÍ:**
- Vị trí: ${s.jobPosition}
- Địa điểm: ${r.job.locationRequirement}

**ỨNG VIÊN CẦN SO SÁNH:**
${a.map((t,h)=>`
${h+1}. ${t.name}
   - Hạng: ${t.rank} (${t.score} điểm)
   - Vị trí: ${t.title}
   - Cấp độ: ${t.level}
   - Điểm mạnh: ${t.strengths.slice(0,3).join(", ")}
   - Điểm yếu: ${t.weaknesses.slice(0,2).join(", ")}
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
`},J=({analysisData:r,selectedCandidates:s=[],onClose:i})=>{const[a,t]=C.useState(!1),[h,g]=C.useState([]),[d,x]=C.useState("general"),[N,T]=C.useState(""),u=C.useMemo(()=>{const n=r.candidates.filter(l=>l.status==="SUCCESS"),o=[...new Set(n.map(l=>l.industry).filter(Boolean))],c=[...new Set(n.map(l=>l.experienceLevel).filter(Boolean))],b=n.filter(l=>{var m;return((m=l.analysis)==null?void 0:m.Hạng)==="A"}).slice(0,5),S=new Map;n.forEach(l=>{var m,y;(y=(m=l.analysis)==null?void 0:m["Điểm yếu CV"])==null||y.forEach(j=>{S.set(j,(S.get(j)||0)+1)})});const A=new Map;return n.forEach(l=>{var m,y;(y=(m=l.analysis)==null?void 0:m["Chi tiết"])==null||y.forEach(j=>{const H=parseFloat(j.Điểm.split("/")[0]),E=parseFloat(j.Điểm.split("/")[1]);H/E*100<50&&A.set(j["Tiêu chí"],(A.get(j["Tiêu chí"])||0)+1)})}),{jobPosition:r.job.position,totalCandidates:n.length,industries:o.slice(0,3),levels:c.slice(0,3),topCandidates:b,commonWeaknesses:Array.from(S.entries()).sort((l,m)=>m[1]-l[1]).slice(0,5).map(([l])=>l),skillGaps:Array.from(A.entries()).sort((l,m)=>m[1]-l[1]).slice(0,5).map(([l])=>l)}},[r]),k=async()=>{t(!0);try{let n=null;d==="specific"&&N?n=r.candidates.find(c=>c.id===N):d==="comparative"&&s.length>0&&(n=s);const o=await U(r,u,d,n);g(o)}catch(n){console.error("Error generating questions:",n),g(p())}finally{t(!1)}},p=()=>{const{jobPosition:n,industries:o,commonWeaknesses:c}=u;return[{category:"Câu hỏi chung về vị trí",icon:"fa-solid fa-briefcase",color:"text-blue-400",questions:[`Bạn hiểu như thế nào về vai trò ${n} trong tổ chức?`,`Những thách thức lớn nhất mà một ${n} thường gặp phải là gì?`,`Bạn có kinh nghiệm gì liên quan đến ${n}?`,"Tại sao bạn quan tâm đến vị trí này?","Điều gì làm bạn khác biệt so với các ứng viên khác?"]},{category:"Câu hỏi kỹ thuật theo ngành",icon:"fa-solid fa-cogs",color:"text-green-400",questions:o.length>0?[`Trong ngành ${o[0]}, xu hướng nào đang ảnh hưởng lớn nhất?`,"Bạn đã từng giải quyết vấn đề phức tạp nào trong công việc?","Mô tả một dự án thành công mà bạn đã tham gia.","Bạn cập nhật kiến thức chuyên môn bằng cách nào?"]:["Mô tả kinh nghiệm làm việc ấn tượng nhất của bạn.","Bạn xử lý áp lực công việc như thế nào?","Kỹ năng nào bạn muốn phát triển thêm?"]},{category:"Câu hỏi về điểm yếu phổ biến",icon:"fa-solid fa-exclamation-triangle",color:"text-orange-400",questions:c.length>0?[`Nhiều ứng viên có vấn đề về "${c[0]}". Bạn tự đánh giá thế nào?`,"Bạn đã khắc phục những thiếu sót trong CV như thế nào?","Điểm yếu lớn nhất của bạn là gì và bạn cải thiện ra sao?"]:["Điểm yếu lớn nhất của bạn là gì?","Bạn học hỏi từ thất bại như thế nào?","Kỹ năng nào bạn cần cải thiện?"]}]},f=r.candidates.filter(n=>n.status==="SUCCESS").sort((n,o)=>{var c,b;return(((c=o.analysis)==null?void 0:c["Tổng điểm"])||0)-(((b=n.analysis)==null?void 0:b["Tổng điểm"])||0)});return e.jsxs("div",{className:"bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl max-w-4xl mx-auto",children:[e.jsx("div",{className:"p-6 border-b border-slate-800 bg-slate-900/50",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsxs("h2",{className:"text-2xl font-bold text-white flex items-center gap-3",children:[e.jsx("i",{className:"fa-solid fa-question-circle text-purple-400"}),"Gợi ý Câu hỏi Phỏng vấn AI"]}),e.jsx("p",{className:"text-slate-300 mt-2",children:"Tạo câu hỏi phỏng vấn thông minh dựa trên JD và dữ liệu lọc CV"})]}),i&&e.jsx("button",{onClick:i,className:"text-slate-400 hover:text-white transition-colors p-2",children:e.jsx("i",{className:"fa-solid fa-times text-xl"})})]})}),e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-800",children:[e.jsxs("h3",{className:"text-lg font-semibold text-white mb-3 flex items-center gap-2",children:[e.jsx("i",{className:"fa-solid fa-chart-bar text-cyan-400"}),"Tổng quan dữ liệu lọc CV"]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 text-sm",children:[e.jsxs("div",{className:"bg-slate-950/50 rounded-lg p-3 border border-slate-800",children:[e.jsx("div",{className:"text-slate-400",children:"Vị trí tuyển dụng"}),e.jsx("div",{className:"text-white font-semibold",children:u.jobPosition})]}),e.jsxs("div",{className:"bg-slate-950/50 rounded-lg p-3 border border-slate-800",children:[e.jsx("div",{className:"text-slate-400",children:"Tổng ứng viên"}),e.jsx("div",{className:"text-white font-semibold",children:u.totalCandidates})]}),e.jsxs("div",{className:"bg-slate-950/50 rounded-lg p-3 border border-slate-800",children:[e.jsx("div",{className:"text-slate-400",children:"Ứng viên hạng A"}),e.jsx("div",{className:"text-white font-semibold",children:u.topCandidates.length})]})]}),u.industries.length>0&&e.jsxs("div",{className:"mt-3",children:[e.jsx("div",{className:"text-slate-400 text-sm",children:"Ngành nghề chính:"}),e.jsx("div",{className:"flex flex-wrap gap-2 mt-1",children:u.industries.map((n,o)=>e.jsx("span",{className:"bg-blue-900/20 text-blue-300 px-2 py-1 rounded text-xs border border-blue-900/30",children:n},o))})]})]}),e.jsxs("div",{className:"mb-6",children:[e.jsx("h3",{className:"text-lg font-semibold text-white mb-3",children:"Chọn loại câu hỏi:"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3",children:[e.jsxs("button",{onClick:()=>x("general"),className:`p-4 rounded-xl border transition-all ${d==="general"?"border-purple-500 bg-purple-900/20 text-purple-300":"border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600"}`,children:[e.jsx("i",{className:"fa-solid fa-users text-xl mb-2 block"}),e.jsx("div",{className:"font-semibold",children:"Câu hỏi chung"}),e.jsx("div",{className:"text-sm opacity-80",children:"Dựa trên JD và xu hướng chung"})]}),e.jsxs("button",{onClick:()=>x("specific"),className:`p-4 rounded-xl border transition-all ${d==="specific"?"border-green-500 bg-green-900/20 text-green-300":"border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600"}`,children:[e.jsx("i",{className:"fa-solid fa-user text-xl mb-2 block"}),e.jsx("div",{className:"font-semibold",children:"Câu hỏi cụ thể"}),e.jsx("div",{className:"text-sm opacity-80",children:"Dành cho 1 ứng viên cụ thể"})]}),e.jsxs("button",{onClick:()=>x("comparative"),className:`p-4 rounded-xl border transition-all ${d==="comparative"?"border-orange-500 bg-orange-900/20 text-orange-300":"border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600"}`,children:[e.jsx("i",{className:"fa-solid fa-balance-scale text-xl mb-2 block"}),e.jsx("div",{className:"font-semibold",children:"So sánh ứng viên"}),e.jsx("div",{className:"text-sm opacity-80",children:"Câu hỏi để so sánh nhiều ứng viên"})]})]})]}),d==="specific"&&e.jsxs("div",{className:"mb-6",children:[e.jsx("label",{className:"block text-white font-semibold mb-2",children:"Chọn ứng viên:"}),e.jsxs("select",{value:N,onChange:n=>T(n.target.value),className:"w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white",children:[e.jsx("option",{value:"",children:"-- Chọn ứng viên --"}),f.map(n=>{var o,c;return e.jsxs("option",{value:n.id,children:[n.candidateName," - Hạng ",(o=n.analysis)==null?void 0:o.Hạng," (",(c=n.analysis)==null?void 0:c["Tổng điểm"]," điểm)"]},n.id)})]})]}),d==="comparative"&&s.length>0&&e.jsxs("div",{className:"mb-6 bg-slate-900/50 rounded-xl p-4 border border-slate-800",children:[e.jsx("h4",{className:"text-white font-semibold mb-2",children:"Ứng viên được chọn để so sánh:"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:s.map(n=>{var o;return e.jsxs("span",{className:"bg-orange-900/30 text-orange-300 px-3 py-1 rounded-full text-sm border border-orange-900/40",children:[n.candidateName," (Hạng ",(o=n.analysis)==null?void 0:o.Hạng,")"]},n.id)})})]}),e.jsx("div",{className:"text-center mb-6",children:e.jsx("button",{onClick:k,disabled:a||d==="specific"&&!N,className:"bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed",children:a?e.jsxs(e.Fragment,{children:[e.jsx("i",{className:"fa-solid fa-spinner fa-spin mr-2"}),"Đang tạo câu hỏi..."]}):e.jsxs(e.Fragment,{children:[e.jsx("i",{className:"fa-solid fa-magic mr-2"}),"Tạo câu hỏi phỏng vấn"]})})}),h.length>0&&e.jsxs("div",{className:"space-y-6",children:[e.jsxs("h3",{className:"text-xl font-bold text-white flex items-center gap-2",children:[e.jsx("i",{className:"fa-solid fa-list-check text-green-400"}),"Câu hỏi phỏng vấn được đề xuất"]}),h.map((n,o)=>e.jsxs("div",{className:"bg-slate-900/50 rounded-xl border border-slate-800",children:[e.jsx("div",{className:"p-4 border-b border-slate-800",children:e.jsxs("h4",{className:`text-lg font-semibold ${n.color} flex items-center gap-2`,children:[e.jsx("i",{className:n.icon}),n.category]})}),e.jsx("div",{className:"p-4",children:e.jsx("div",{className:"space-y-3",children:n.questions.map((c,b)=>e.jsxs("div",{className:"flex items-start gap-3 p-3 bg-slate-950/50 rounded-lg hover:bg-slate-900/80 transition-colors border border-slate-800/50",children:[e.jsx("div",{className:`w-6 h-6 rounded-full ${n.color.replace("text-","bg-").replace("400","500")} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`,children:b+1}),e.jsx("p",{className:"text-slate-200 leading-relaxed",children:c}),e.jsx("button",{onClick:()=>navigator.clipboard.writeText(c),className:"text-slate-400 hover:text-white transition-colors p-1 flex-shrink-0",title:"Copy câu hỏi",children:e.jsx("i",{className:"fa-solid fa-copy"})})]},b))})})]},o)),e.jsx("div",{className:"text-center",children:e.jsxs("button",{onClick:()=>{const n=h.map(o=>`${o.category}:
${o.questions.map((c,b)=>`${b+1}. ${c}`).join(`
`)}`).join(`

`);navigator.clipboard.writeText(n)},className:"bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors border border-slate-700",children:[e.jsx("i",{className:"fa-solid fa-copy mr-2"}),"Copy tất cả câu hỏi"]})})]})]})]})};export{J as I};
