const t=r=>r==null||isNaN(r)?"0 ₫":new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",maximumFractionDigits:0}).format(r);export{t as f};
