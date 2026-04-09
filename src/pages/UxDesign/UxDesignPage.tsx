import { useState } from 'react';
import React from 'react';
import { Icon, IconName } from '../../components/Icon';
import { Badge, Card, SectionCard, FormGroup } from '../../components/atoms';
import { AIInsightCard, VecCard } from '../../components/molecules';

export const UxDesignPage = () => {
  const [section, setSection] = useState('info-arch');
  const SECTIONS = [
    {id:'info-arch',title:'\u60C5\u5831\u8A2D\u8A08 (IA)',icon:'filter'},
    {id:'nav-design',title:'\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3',icon:'list'},
    {id:'form-design',title:'\u30D5\u30A9\u30FC\u30E0\u8A2D\u8A08',icon:'plus'},
    {id:'list-design',title:'\u4E00\u89A7\u30FB\u30D5\u30A3\u30EB\u30BF',icon:'sort'},
    {id:'feedback',title:'\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF',icon:'check'},
    {id:'a11y',title:'A11y (WCAG)',icon:'info'},
    {id:'btob',title:'BtoB\u539F\u5247',icon:'about'},
    {id:'design-system',title:'\u30C7\u30B6\u30A4\u30F3\u30B7\u30B9\u30C6\u30E0',icon:'scan'},
  ];

  const CONTENT = {
    'info-arch': <>
      <AIInsightCard loading={false} chips={[]}><strong>\u60C5\u5831\u8A2D\u8A08</strong>\u306F\u300C\u3069\u3053\u306B\u4F55\u304C\u3042\u308B\u304B\u300D\u3092\u30E6\u30FC\u30B6\u30FC\u304C\u76F4\u611F\u7684\u306B\u7406\u89E3\u3067\u304D\u308B\u69CB\u9020\u3092\u4F5C\u308B\u30D7\u30ED\u30BB\u30B9\u3002BtoB\u3067\u306F\u30E6\u30FC\u30B6\u30FC\u306E\u30E1\u30F3\u30BF\u30EB\u30E2\u30C7\u30EB\uFF08\u696D\u52D9\u30D5\u30ED\u30FC\uFF09\u3068\u753B\u9762\u69CB\u6210\u3092\u5408\u81F4\u3055\u305B\u308B\u3053\u3068\u304C\u6700\u91CD\u8981\u3067\u3059\u3002</AIInsightCard>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="Matlens \u306E IA \u539F\u5247">
          {[['\u30E6\u30FC\u30B6\u30FC\u30B4\u30FC\u30EB\u512A\u5148','\u300C\u4F55\u3092\u3057\u305F\u3044\u304B\u300D\u304B\u3089\u8A2D\u8A08\u3002\u6750\u6599\u691C\u7D22\u2192\u8A73\u7D30\u2192\u7DE8\u96C6\u3092\u30EF\u30F3\u30A2\u30AF\u30B7\u30E7\u30F3\u3067\u8FBF\u308C\u308B\u3002'],['\u6BB5\u968E\u7684\u958B\u793A','\u6700\u521D\u306F\u91CD\u8981\u60C5\u5831\u306E\u307F\u3002\u8A73\u7D30\u6761\u4EF6\u306F\u300C\u8A73\u7D30\u300D\u5C55\u958B\u3067\u3002\u8A8D\u77E5\u8CA0\u8377\u3092\u6BB5\u968E\u7684\u306B\u3002'],['\u30B3\u30F3\u30C6\u30AD\u30B9\u30C8\u7DAD\u6301','\u4E00\u89A7\u2192\u8A73\u7D30\u2192\u7DE8\u96C6\u306E\u9077\u79FB\u3067\u30D5\u30A3\u30EB\u30BF\u72B6\u614B\u3092\u7DAD\u6301\u3002\u4F5C\u696D\u6587\u8108\u3092\u5931\u308F\u306A\u3044\u3002'],['\u30A8\u30E9\u30FC\u9632\u6B62','\u524A\u9664\u78BA\u8A8D\u30C0\u30A4\u30A2\u30ED\u30B0\u3002AI\u7570\u5E38\u5024\u691C\u51FA\u306B\u3088\u308B\u4E8B\u524D\u8B66\u544A\u3002\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u30D0\u30EA\u30C7\u30FC\u30B7\u30E7\u30F3\u3002']].map(([t,d])=>(
            <div key={t} className="flex gap-2.5 py-2 border-b border-[var(--border-faint)] last:border-b-0"><Icon name="check" size={13} className="text-ok flex-shrink-0 mt-0.5"/><div><div className="text-[13px] font-bold text-text-hi">{t}</div><div className="text-[12px] text-text-md mt-0.5">{d}</div></div></div>
          ))}
        </SectionCard>
        <SectionCard title="\u30B5\u30A4\u30C8\u30DE\u30C3\u30D7">
          <pre className="font-mono text-[11px] bg-sunken p-3 rounded border border-[var(--border-faint)] leading-[1.9]">{`Matlens
\u251C\u2500\u2500 \u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9
\u2502   \u251C\u2500\u2500 KPI \u00D7 4
\u2502   \u251C\u2500\u2500 AI \u30A4\u30F3\u30B5\u30A4\u30C8
\u2502   \u2514\u2500\u2500 Chart.js \u30B0\u30E9\u30D5 \u00D7 4
\u251C\u2500\u2500 \u6750\u6599\u30C7\u30FC\u30BF
\u2502   \u251C\u2500\u2500 \u4E00\u89A7 (\u8907\u5408\u30D5\u30A3\u30EB\u30BF)
\u2502   \u251C\u2500\u2500 \u8A73\u7D30
\u2502   \u251C\u2500\u2500 \u65B0\u898F\u767B\u9332
\u2502   \u2514\u2500\u2500 \u7DE8\u96C6
\u251C\u2500\u2500 AI / \u30D9\u30AF\u30C8\u30EB
\u2502   \u251C\u2500\u2500 \u30D9\u30AF\u30C8\u30EB\u691C\u7D22 VSS
\u2502   \u251C\u2500\u2500 RAG \u30C1\u30E3\u30C3\u30C8
\u2502   \u2514\u2500\u2500 \u985E\u4F3C\u6750\u6599\u63A2\u7D22
\u251C\u2500\u2500 \u958B\u767A\u30C4\u30FC\u30EB
\u2502   \u251C\u2500\u2500 API \u30C7\u30D0\u30C3\u30B0
\u2502   \u2514\u2500\u2500 \u30C6\u30B9\u30C8\u30B9\u30A4\u30FC\u30C8
\u2514\u2500\u2500 \u30C9\u30AD\u30E5\u30E1\u30F3\u30C8
    \u251C\u2500\u2500 UX \u8A2D\u8A08\u30AC\u30A4\u30C9 \u2190 \u73FE\u5728\u5730
    \u251C\u2500\u2500 \u30D8\u30EB\u30D7\u30FB\u7528\u8A9E\u96C6
    \u2514\u2500\u2500 \u6280\u8853\u30B9\u30BF\u30C3\u30AF`}</pre>
        </SectionCard>
      </div>
    </>,
    'nav-design': <>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3\u8A2D\u8A08\u539F\u5247">
          {[['\u73FE\u5728\u5730\u306E\u660E\u793A','\u30A2\u30AF\u30C6\u30A3\u30D6\u30A2\u30A4\u30C6\u30E0\u3092\u5DE6\u30DC\u30FC\u30C0\u30FC+\u80CC\u666F\u8272\u3067\u5F37\u8ABF\u3002\u8A73\u7D30\u753B\u9762\u3067\u306Fbreadcrumb\u3002'],['\u6298\u308A\u7573\u307F\u306B\u3088\u308B\u7A7A\u9593\u78BA\u4FDD','\u30B5\u30A4\u30C9\u30D0\u30FC\u30C8\u30B0\u30EB\u3067\u4F5C\u696D\u9818\u57DF\u3092\u6700\u5927\u5316\u3002\u30A2\u30A4\u30B3\u30F3+\u30C4\u30FC\u30EB\u30C1\u30C3\u30D7\u3067\u6298\u308A\u7573\u307F\u6642\u3082\u64CD\u4F5C\u53EF\u80FD\u3002'],['\u591A\u52D5\u7DDA\u8A2D\u8A08','\u3088\u304F\u4F7F\u3046\u64CD\u4F5C\u306F\u30D8\u30C3\u30C0\u30FC\u306E\u30A2\u30AF\u30B7\u30E7\u30F3\u30DC\u30BF\u30F3\u3067\u3082\u5230\u9054\u3067\u304D\u308B\u3002\u30B7\u30E7\u30FC\u30C8\u30AB\u30C3\u30C8\u52D5\u7DDA\u306E\u78BA\u4FDD\u3002'],['\u30B9\u30B3\u30FC\u30D7\u306E\u660E\u793A','\u30BB\u30AF\u30B7\u30E7\u30F3\u5206\u3051\uFF08\u30E1\u30A4\u30F3/AI/\u958B\u767A/\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\uFF09\u3067\u6A5F\u80FD\u306E\u6587\u8108\u3092\u4F1D\u3048\u308B\u3002']].map(([t,d])=>(
            <div key={t} className="bg-raised border border-[var(--border-faint)] rounded p-3 mb-2 last:mb-0"><div className="text-[13px] font-bold text-text-hi mb-1">{t}</div><div className="text-[12px] text-text-md">{d}</div></div>
          ))}
        </SectionCard>
        <SectionCard title="\u30CA\u30D3\u30D1\u30BF\u30FC\u30F3\u6BD4\u8F03">
          <table className="w-full text-[12px]"><thead><tr className="border-b border-[var(--border-faint)]"><th className="px-2 py-2 text-left font-bold text-text-lo">\u30D1\u30BF\u30FC\u30F3</th><th className="px-2 py-2 text-left font-bold text-text-lo">Matlens\u3067\u306E\u63A1\u7528</th></tr></thead>
          <tbody>{[['\u30B5\u30A4\u30C9\u30D0\u30FC\u30CA\u30D3','\u63A1\u7528 \u2014 \u4E3B\u30CA\u30D3'],['\u30DA\u30FC\u30B8\u30D8\u30C3\u30C0\u30FC+CTA','\u63A1\u7528 \u2014 \u30A2\u30AF\u30B7\u30E7\u30F3\u914D\u7F6E'],['\u30BF\u30D6','\u63A1\u7528 \u2014 API\u30FB\u30D8\u30EB\u30D7'],['\u30D6\u30EC\u30C3\u30C9\u30AF\u30E9\u30E0','\u63A1\u7528 \u2014 \u8A73\u7D30\u753B\u9762'],['\u884C\u30EC\u30D9\u30EB\u30A2\u30AF\u30B7\u30E7\u30F3','\u63A1\u7528 \u2014 \u30C6\u30FC\u30D6\u30EB'],['\u30E2\u30FC\u30C0\u30EB\u78BA\u8A8D','\u63A1\u7528 \u2014 \u524A\u9664\u78BA\u8A8D']].map(([p,a])=>(
            <tr key={p} className="border-b border-[var(--border-faint)] hover:bg-hover"><td className="px-2 py-2 font-semibold">{p}</td><td className="px-2 py-2"><Badge variant="green">{a}</Badge></td></tr>
          ))}</tbody></table>
        </SectionCard>
      </div>
    </>,
    'form-design': <>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="\u30D5\u30A9\u30FC\u30E0\u8A2D\u8A087\u539F\u5247">
          {[['\u30E9\u30D9\u30EB\u306F\u5E38\u306B\u8868\u793A','\u30D7\u30EC\u30FC\u30B9\u30DB\u30EB\u30C0\u30FC\u3060\u3051\u3067\u306A\u304F\u3001\u5E38\u6642\u8868\u793A\u306E\u30E9\u30D9\u30EB\u3092\u5FC5\u305A\u914D\u7F6E\u3002'],['\u5FC5\u9808\u30FB\u4EFB\u610F\u3092\u660E\u793A','* \u3067\u5FC5\u9808\u3092\u793A\u3057\u3001\u4EFB\u610F\u306B\u306F\uFF08\u4EFB\u610F\uFF09\u3068\u8A18\u8F09\u3002'],['\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u30D0\u30EA\u30C7\u30FC\u30B7\u30E7\u30F3','onBlur\u6642\u306B\u305D\u306E\u5834\u3067\u30A8\u30E9\u30FC\u8868\u793A\u3002\u9001\u4FE1\u307E\u3067\u5F85\u305F\u306A\u3044\u3002'],['\u30A4\u30F3\u30E9\u30A4\u30F3\u30A8\u30E9\u30FC','\u30D5\u30A3\u30FC\u30EB\u30C9\u76F4\u4E0B\u306B\u8D64\u8272+\u30A2\u30A4\u30B3\u30F3+\u8AAC\u660E\u6587\u3067\u30A8\u30E9\u30FC\u3092\u8868\u793A\u3002'],['\u9069\u5207\u306Ainput\u7A2E\u5225','\u6570\u5024\u306Fnumber+\u5358\u4F4D\u3002\u9078\u629E\u80A2\u306Fselect or radio\u3002'],['\u30B0\u30EB\u30FC\u30D4\u30F3\u30B0','\u95A2\u9023\u30D5\u30A3\u30FC\u30EB\u30C9\u3092\u8996\u899A\u7684\u306B\u307E\u3068\u3081\u308B\uFF08\u67A0\u30FB\u898B\u51FA\u3057\uFF09\u3002'],['AI\u30A2\u30B7\u30B9\u30C8','\u7D44\u6210\u5165\u529B\u3067\u7269\u6027\u5024\u3092\u81EA\u52D5\u63D0\u6848\u3002\u5165\u529B\u5DE5\u6570\u3092\u5927\u5E45\u524A\u6E1B\u3002']].map(([t,d])=>(
            <div key={t} className="flex gap-2 py-1.5 border-b border-[var(--border-faint)] last:border-b-0 text-[12px]"><Icon name="check" size={12} className="text-ok flex-shrink-0 mt-0.5"/><div><strong className="text-text-hi">{t}</strong> \u2014 {d}</div></div>
          ))}
        </SectionCard>
        <SectionCard title="\u30D0\u30EA\u30C7\u30FC\u30B7\u30E7\u30F3\u8A2D\u8A08">
          <div className="text-[12px] text-text-md leading-[1.8]">
            <div className="font-bold text-text-hi mb-2">\u30BF\u30A4\u30DF\u30F3\u30B0</div>
            {[['onChange','\u5165\u529B\u4E2D\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\uFF08\u6570\u5024\u7BC4\u56F2\uFF09'],['onBlur','\u30D5\u30A9\u30FC\u30AB\u30B9\u30A2\u30A6\u30C8\u6642\uFF08\u5FC5\u9808\u30FB\u5F62\u5F0F\uFF09'],['onSubmit','\u9001\u4FE1\u6642\u6700\u7D42\u30C1\u30A7\u30C3\u30AF']].map(([t,d])=>(
              <div key={t} className="flex gap-2 mb-2"><code className="text-[11px] bg-raised px-1.5 py-0.5 rounded border border-[var(--border-faint)] text-accent w-20 text-center flex-shrink-0">{t}</code><span>{d}</span></div>
            ))}
            <div className="font-bold text-text-hi mb-2 mt-3">\u30A8\u30E9\u30FC\u30E1\u30C3\u30BB\u30FC\u30B8</div>
            <div className="bg-err-dim border border-[var(--err)] rounded p-2 text-err text-[12px] mb-2"><strong>\u60AA:</strong> \u300C\u7121\u52B9\u306A\u5024\u3067\u3059\u300D</div>
            <div className="bg-[var(--ok-dim)] border border-ok rounded p-2 text-ok text-[12px]"><strong>\u826F:</strong> \u300C\u786C\u5EA6\u306F 0\u301C5000 HV \u306E\u7BC4\u56F2\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u300D</div>
          </div>
        </SectionCard>
      </div>
    </>,
    'list-design': <>
      <SectionCard title="\u4E00\u89A7\u30FB\u30D5\u30A3\u30EB\u30BF\u8A2D\u8A08\u30D1\u30BF\u30FC\u30F3">
        <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          {[['\u5168\u6587\u691C\u7D22','\u540D\u79F0\u30FBID\u30FB\u7D44\u6210\u30FB\u5099\u8003\u3092\u6A2A\u65AD\u691C\u7D22\u3002\u30C7\u30D0\u30A6\u30F3\u30B9\u3067\u5165\u529B\u9045\u5EF6\u9632\u6B62\u3002'],['\u30D5\u30A1\u30BB\u30C3\u30C8\u30D5\u30A3\u30EB\u30BF','\u30AB\u30C6\u30B4\u30EA\u30FB\u30B9\u30C6\u30FC\u30BF\u30B9\u30FB\u30D0\u30C3\u30C1\u306E\u30C9\u30ED\u30C3\u30D7\u30C0\u30A6\u30F3\u3002AND\u7D5E\u308A\u8FBC\u307F\u3002'],['\u6570\u5024\u7BC4\u56F2\u30D5\u30A3\u30EB\u30BF','\u6700\u5C0F\u301C\u6700\u5927\u306E\u7BC4\u56F2\u6307\u5B9A\u3002\u8A73\u7D30\u30D1\u30CD\u30EB\u306B\u96A0\u3057\u3066\u521D\u671F\u8868\u793A\u7C21\u6F54\u5316\u3002'],['\u30A2\u30AF\u30C6\u30A3\u30D6\u30BF\u30B0','\u6709\u52B9\u306A\u30D5\u30A3\u30EB\u30BF\u3092\u30BF\u30B0\u8868\u793A\u3002\u500B\u5225\u30FB\u4E00\u62EC\u89E3\u9664\u5BFE\u5FDC\u3002'],['\u30BD\u30FC\u30C8','\u5217\u5358\u4F4D\u306E\u6607\u964D\u9806\u3002\u73FE\u5728\u30BD\u30FC\u30C8\u3092\u8996\u899A\u7684\u306B\u8868\u793A\u3002'],['\u30DA\u30FC\u30B8\u30CD\u30FC\u30B7\u30E7\u30F3','\u5927\u91CF\u30C7\u30FC\u30BF\u3092\u5206\u5272\u8868\u793A\u3002\u4EF6\u6570/\u30DA\u30FC\u30B8\u3082\u5909\u66F4\u53EF\u80FD\u3002']].map(([t,d])=>(
            <div key={t} className="bg-raised border border-[var(--border-faint)] rounded p-3"><div className="text-[13px] font-bold text-text-hi mb-1">{t}</div><div className="text-[12px] text-text-md">{d}</div></div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="\u30C6\u30FC\u30D6\u30EB\u8A2D\u8A08\u30AC\u30A4\u30C9\u30E9\u30A4\u30F3">
        <table className="w-full text-[12px]"><thead><tr className="border-b border-[var(--border-faint)]"><th className="px-3 py-2 text-left font-bold text-text-lo">\u9805\u76EE</th><th className="px-3 py-2 text-left font-bold text-text-lo">\u65B9\u91DD</th><th className="px-3 py-2 text-left font-bold text-text-lo">\u5B9F\u88C5</th></tr></thead>
        <tbody>{[['\u5217\u5E45','\u56FA\u5B9A\u5E45(colgroup)\u3067\u6570\u5024\u30FB\u30B9\u30C6\u30FC\u30BF\u30B9\u5217\u3092\u5236\u5FA1','tableLayout:fixed'],['\u6570\u5024\u8868\u793A','\u53F3\u63C3\u3048 + toLocaleString()','text-right font-mono'],['\u30C6\u30AD\u30B9\u30C8\u7701\u7565','ellipsis + title\u5C5E\u6027','truncate + title'],['\u884C\u9078\u629E','\u30C1\u30A7\u30C3\u30AF\u30DC\u30C3\u30AF\u30B9 + \u884C\u30AF\u30EA\u30C3\u30AF','bg-accent-dim selected'],['\u7A7A\u72B6\u614B','0\u4EF6\u6642\u306B\u7A7A\u72B6\u614BUI\u3092\u8868\u793A','Empty component'],].map(([t,p,e])=>(
          <tr key={t} className="border-b border-[var(--border-faint)] hover:bg-hover"><td className="px-3 py-2 font-semibold">{t}</td><td className="px-3 py-2 text-text-md">{p}</td><td className="px-3 py-2 font-mono text-[11px] text-text-lo">{e}</td></tr>
        ))}</tbody></table>
      </SectionCard>
    </>,
    'feedback': <>
      <SectionCard title="\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u8A2D\u8A08\u306E4\u5C64">
        <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
          {[['\u5373\u6642 (<100ms)','\u30DC\u30BF\u30F3\u62BC\u4E0B\u306Evisual feedback\u3002hover/focus\u72B6\u614B\u3002','accent'],['\u77ED\u671F (\u301C2s)','\u30ED\u30FC\u30C7\u30A3\u30F3\u30B0\u30FBTyping \u30A4\u30F3\u30B8\u30B1\u30FC\u30BF\u30FC\uFF08AI\u5FDC\u7B54\u5F85\u3061\uFF09\u3002','ai'],['\u64CD\u4F5C\u5B8C\u4E86','Toast\u901A\u77E5\uFF08\u767B\u9332\u30FB\u66F4\u65B0\u30FB\u524A\u9664\uFF09\u30023\u79D2\u5F8C\u81EA\u52D5\u6D88\u53BB\u3002','ok'],['\u30A8\u30E9\u30FC\u30FB\u8B66\u544A','\u30E2\u30FC\u30C0\u30EB\uFF08\u524A\u9664\u78BA\u8A8D\uFF09\u3002\u30A4\u30F3\u30E9\u30A4\u30F3\u30A8\u30E9\u30FC\u3002\u30D0\u30CA\u30FC\u3002','warn']].map(([t,d,c])=>(
            <div key={t} className={`bg-[var(--${c}-dim)] border border-[var(--${c})] rounded p-3`}><div className="text-[13px] font-bold text-text-hi mb-1.5">{t}</div><div className="text-[12px] text-text-md">{d}</div></div>
          ))}
        </div>
      </SectionCard>
    </>,
    'a11y': <>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="WCAG 2.1 AA \u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8">
          {[['\u30B3\u30F3\u30C8\u30E9\u30B9\u30C8\u6BD4 4.5:1\u4EE5\u4E0A'],['focus-visible \u30D5\u30A9\u30FC\u30AB\u30B9\u30EA\u30F3\u30B0'],['\u30AD\u30FC\u30DC\u30FC\u30C9\u5B8C\u5168\u64CD\u4F5C'],['aria-label / role / aria-current'],['\u30B9\u30AD\u30C3\u30D7\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3'],['\u6700\u5C0F\u30D5\u30A9\u30F3\u30C8\u30B5\u30A4\u30BA 12px'],['\u8272+\u30A2\u30A4\u30B3\u30F3+\u30C6\u30AD\u30B9\u30C8\u306E\u30BB\u30C3\u30C8'],['\u30E9\u30D9\u30EB\u306E\u30D5\u30A9\u30FC\u30E0\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB\u95A2\u9023\u4ED8\u3051']].map(([t])=>(
            <div key={t} className="flex gap-2 py-1.5 border-b border-[var(--border-faint)] last:border-b-0 text-[12px]"><Icon name="check" size={12} className="text-ok flex-shrink-0 mt-0.5"/><span className="text-text-hi">{t}</span></div>
          ))}
        </SectionCard>
        <SectionCard title="\u5B9F\u88C5\u30B3\u30FC\u30C9\u4F8B">
          <pre className="bg-sunken rounded p-3 font-mono text-[11px] leading-[1.9] border border-[var(--border-faint)]">{`/* focus-visible */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* ARIA */
<nav aria-label="\u30E1\u30A4\u30F3\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3">
<button aria-current="page">\u4E00\u89A7</button>
<input aria-required="true"
  aria-describedby="hint-01">
<div role="alert" aria-live="polite">

/* \u30B9\u30AD\u30C3\u30D7\u30CA\u30D3 */
<a href="#main" class="skip-nav">
  \u30B3\u30F3\u30C6\u30F3\u30C4\u3078\u30B9\u30AD\u30C3\u30D7
</a>

/* \u8272+\u5F62\u306E\u7D44\u307F\u5408\u308F\u305B */
// OK: <Badge>\u627F\u8A8D\u6E08</Badge>  \u2190 \u8272+\u30C6\u30AD\u30B9\u30C8
// NG: \u8272\u306E\u307F\u3067\u72B6\u614B\u3092\u8868\u73FE`}</pre>
        </SectionCard>
      </div>
    </>,
    'btob': <>
      <SectionCard title="BtoB\u696D\u52D9\u30B7\u30B9\u30C6\u30E0\u8A2D\u8A08\u306E\u56FA\u6709\u539F\u5247">
        <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          {[['\u60C5\u5831\u5BC6\u5EA6','BtoB\u306F\u9AD8\u5BC6\u5EA6\u304C\u6B63\u7FA9\u30021\u753B\u9762\u3067\u591A\u304F\u306E\u30C7\u30FC\u30BF\u3092\u898B\u6E21\u305B\u308B\u3053\u3068\u3092\u512A\u5148\u3002\u4F59\u767D\u306FBtoC\u307B\u3069\u53D6\u3089\u306A\u3044\u3002','about'],['\u64CD\u4F5C\u52B9\u7387','\u7E70\u308A\u8FD4\u3057\u64CD\u4F5C\uFF08\u4E00\u62EC\u51E6\u7406\u30FB\u30B7\u30E7\u30FC\u30C8\u30AB\u30C3\u30C8\uFF09\u3092\u91CD\u8996\u3002\u719F\u7DF4\u8005\u306E\u751F\u7523\u6027\u3092\u6700\u5927\u5316\u3002','filter'],['\u30A8\u30E9\u30FC\u8010\u6027','\u30C7\u30FC\u30BF\u640D\u5931\u30FB\u8AA4\u64CD\u4F5C\u306E\u5F71\u97FF\u304C\u5927\u304D\u3044\u3002\u524A\u9664\u78BA\u8A8D\u30FB\u4E0B\u66F8\u304D\u30FB\u5909\u66F4\u5C65\u6B74\u3092\u5FC5\u305A\u8A2D\u8A08\u3002','warning'],['\u6A29\u9650\u7BA1\u7406','\u95B2\u89A7\u30FB\u7DE8\u96C6\u30FB\u627F\u8A8D\u306E\u30ED\u30FC\u30EB\u5206\u96E2\u3002\u30B9\u30C6\u30FC\u30BF\u30B9\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u8A2D\u8A08\u3002','check'],['\u30D0\u30EB\u30AF\u64CD\u4F5C','\u8907\u6570\u30EC\u30B3\u30FC\u30C9\u3078\u306E\u4E00\u62EC\u64CD\u4F5C\uFF08\u627F\u8A8D\u30FB\u524A\u9664\u30FBCSV\u51FA\u529B\uFF09\u306FBtoB\u5FC5\u9808\u6A5F\u80FD\u3002','list'],['\u76E3\u67FB\u30ED\u30B0','\u3044\u3064\u30FB\u8AB0\u304C\u30FB\u4F55\u3092\u5909\u66F4\u3057\u305F\u304B\u306E\u8A3C\u8DE1\u3002\u30B3\u30F3\u30D7\u30E9\u30A4\u30A2\u30F3\u30B9\u8981\u4EF6\u3078\u306E\u5BFE\u5FDC\u3002','info']].map(([t,d,ico])=>(
            <div key={t} className="bg-raised border border-[var(--border-faint)] rounded p-3"><div className="flex items-center gap-2 mb-1.5"><Icon name={ico as IconName} size={13} className="text-accent"/><div className="text-[13px] font-bold text-text-hi">{t}</div></div><div className="text-[12px] text-text-md">{d}</div></div>
          ))}
        </div>
      </SectionCard>
    </>,
    'design-system': <>
      <SectionCard title="\u30C7\u30B6\u30A4\u30F3\u30C8\u30FC\u30AF\u30F3 \u2014 \u30AB\u30E9\u30FC\u30ED\u30FC\u30EB">
        <div className="grid gap-2" style={{gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))'}}>
          {[['--accent','\u30D7\u30E9\u30A4\u30DE\u30EA\u64CD\u4F5C'],['--ai-col','AI\u6A5F\u80FD'],['--vec','Vector/Embedding'],['--ok','\u6210\u529F\u30FB\u627F\u8A8D'],['--warn','\u8B66\u544A\u30FB\u8981\u30EC\u30D3\u30E5\u30FC'],['--err','\u30A8\u30E9\u30FC\u30FB\u8981\u4FEE\u6B63']].map(([token,role])=>(
            <div key={token} className="p-2 bg-raised border border-[var(--border-faint)] rounded">
              <div className="w-full h-5 rounded mb-1.5" style={{background:`var(${token})`}}/>
              <div className="text-[10px] font-mono text-text-lo">{token}</div>
              <div className="text-[12px] font-semibold text-text-hi">{role}</div>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="\u30BF\u30A4\u30DD\u30B0\u30E9\u30D5\u30A3 \u30B9\u30B1\u30FC\u30EB">
          {[['10px','\u88DC\u52A9\u30E9\u30D9\u30EB\u30FB\u30D0\u30C3\u30B8'],['11px','\u8868\u30D8\u30C3\u30C0\u30FC\u30FB\u30E1\u30BF'],['12px','\u30DC\u30C7\u30A3\u5C0F\u30FB\u88DC\u8DB3'],['13px','\u30DC\u30C7\u30A3\u6A19\u6E96\u30FB\u30D5\u30A9\u30FC\u30E0'],['14px','\u30DC\u30C7\u30A3\u5927\u30FB\u30A4\u30F3\u30D7\u30C3\u30C8'],['17px','\u30DA\u30FC\u30B8\u30BF\u30A4\u30C8\u30EB\u5C0F'],['19px','\u30BB\u30AF\u30B7\u30E7\u30F3\u30BF\u30A4\u30C8\u30EB']].map(([size,usage])=>(
            <div key={size} className="flex items-baseline gap-3 mb-1.5"><span className="w-10 font-mono text-[11px] text-text-lo">{size}</span><span style={{fontSize:size}} className="text-text-hi">\u3042AaBb 123</span><span className="text-[11px] text-text-lo">{usage}</span></div>
          ))}
        </SectionCard>
        <SectionCard title="\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u69CB\u6210 (Atomic Design)">
          <div className="flex flex-col gap-2 text-[12px]">
            {[['Atoms','Button\u00B7Icon\u00B7Badge\u00B7Input\u00B7Select\u00B7Textarea\u00B7UnitInput\u00B7Checkbox\u00B7ProgressBar\u00B7Typing','accent'],['Molecules','SearchBox\u00B7FilterChip\u00B7Modal\u00B7Toast\u00B7KpiCard\u00B7AIInsightCard\u00B7VecCard\u00B7MarkdownBubble\u00B7ExportModal','ai'],['Organisms','Topbar\u00B7Sidebar\u00B7VoicePanel','vec'],['Pages','Dashboard\u00B7List\u00B7Form\u00B7Detail\u00B7VecSearch\u00B7RAGChat\u00B7Similar\u00B7Voice\u00B7API\u00B7Tests\u00B7UX\u00B7Help\u00B7About','ok']].map(([name,items,color])=>(
              <div key={name} className="py-1.5 border-b border-[var(--border-faint)] last:border-b-0"><div className={`text-[11px] font-bold uppercase tracking-[.04em] text-[var(--${color})] mb-0.5`}>{name}</div><div className="text-text-lo">{items}</div></div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>,
  };

  return (
    <div className="flex flex-col gap-4">
      <div><h1 className="ptitle text-[19px] font-bold tracking-tight">UX \u8A2D\u8A08\u30AC\u30A4\u30C9</h1><p className="text-[12px] text-text-lo mt-0.5">BtoB\u696D\u52D9\u30B7\u30B9\u30C6\u30E0\u306B\u304A\u3051\u308B\u60C5\u5831\u8A2D\u8A08\u30FB\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3\u30FB\u30D5\u30A9\u30FC\u30E0\u30FBA11y \u306E\u30D9\u30B9\u30C8\u30D7\u30E9\u30AF\u30C6\u30A3\u30B9</p></div>
      <div className="grid gap-4" style={{gridTemplateColumns:'180px 1fr'}}>
        <div className="flex flex-col gap-0.5">
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)} className={`flex items-center gap-2 px-3 py-2 rounded text-[13px] text-left transition-colors font-ui border-l-2 ${section===s.id?'bg-accent-dim text-accent border-accent font-semibold':'text-text-md border-transparent hover:bg-hover'}`}>
              <Icon name={s.icon as IconName} size={12} className="flex-shrink-0 opacity-70"/><span className="leading-tight">{s.title}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">{(CONTENT as Record<string, React.ReactNode>)[section]}</div>
      </div>
    </div>
  );
};
