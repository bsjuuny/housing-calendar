'use client';

import { CheckSquare, Square, AlertCircle } from 'lucide-react';
import { useAppStore, EligibilityKey } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const ITEMS: { key: EligibilityKey; label: string }[] = [
  { key: 'noHouse', label: '세대구성원 전원이 무주택자다' },
  { key: 'subscriptionAccount', label: '청약통장 가입기간·납입 요건을 충족한다' },
  { key: 'residentInArea', label: '해당 지역(또는 인근) 거주 요건을 충족한다' },
];

/**
 * 자격 "판정"이 아니라 사용자가 스스로 확인하도록 돕는 체크리스트.
 * 답변은 기기에 저장되어 다른 공고를 볼 때도 유지된다.
 */
export default function EligibilityChecklist() {
  const { eligibilityAnswers, setEligibilityAnswer } = useAppStore();

  return (
    <div className="p-6 rounded-[2rem] bg-slate-900 border border-white/5 space-y-4">
      <div className="flex items-center gap-2 text-slate-300 text-sm font-black uppercase tracking-widest">
        <CheckSquare className="w-4 h-4 text-blue-400" />
        청약 자격 셀프 체크
      </div>

      <ul className="space-y-2">
        {ITEMS.map(({ key, label }) => {
          const checked = !!eligibilityAnswers[key];
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setEligibilityAnswer(key, !checked)}
                aria-pressed={checked}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-[0.99]',
                  checked
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-100'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                )}
              >
                {checked ? (
                  <CheckSquare className="w-5 h-5 text-blue-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600 shrink-0" />
                )}
                <span className="text-sm font-bold">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-start gap-2 pt-2">
        <AlertCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
          이 체크리스트는 자격을 판정하지 않습니다. 특별공급 유형·소득/자산 기준 등 세부 요건은
          공고마다 다르므로, 반드시 모집공고문 원문과 청약홈(applyhome.co.kr)의 자격 확인 절차를
          따르세요.
        </p>
      </div>
    </div>
  );
}
