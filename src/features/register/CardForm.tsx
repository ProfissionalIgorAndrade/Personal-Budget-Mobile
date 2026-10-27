import { useEffect, useState } from 'react';

import { createCreditCard } from '@/api/createApi';
import { AmountInput } from '@/components/ui/AmountInput';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { ErrorBanner, Field, FormScreen, PrimaryButton, TextField } from '@/components/ui/Form';
import { useReferenceData } from '@/features/catalog/ReferenceDataContext';
import { COLORS, DUE_DAY_SHORTCUTS } from '@/features/register/constants';
import { MemberChips } from '@/features/register/MemberChips';
import { useCreateAction } from '@/features/register/useCreateAction';

export function CardForm() {
  const { profiles, myProfileId } = useReferenceData();
  const [name, setName] = useState('');
  const [limitCents, setLimitCents] = useState(0);
  const [dueDayText, setDueDayText] = useState('10');
  const [memberId, setMemberId] = useState<string | null>(myProfileId);
  const [color, setColor] = useState(COLORS[0]);
  const { submitting, error, run } = useCreateAction('card');

  useEffect(() => {
    if (!memberId && myProfileId) setMemberId(myProfileId);
  }, [memberId, myProfileId]);

  const dueDay = Number(dueDayText);

  const save = () =>
    run(
      () => {
        if (!name.trim()) return 'Informe o nome do cartão.';
        if (!(limitCents > 0)) return 'O limite do cartão deve ser maior que zero.';
        if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) return 'O dia de vencimento deve estar entre 1 e 31.';
        if (!memberId) return 'Selecione o membro dono do cartão.';
        return null;
      },
      () => createCreditCard({ name: name.trim(), limit: limitCents / 100, dueDay, color, memberId: memberId ?? undefined }),
    );

  return (
    <FormScreen
      title="Novo cartão"
      footer={
        <>
          <ErrorBanner message={error} />
          <PrimaryButton title="Salvar cartão" onPress={() => void save()} loading={submitting} />
        </>
      }
    >
      <Field label="Nome do cartão">
        <TextField value={name} onChangeText={setName} placeholder="Nubank, Inter, C6..." autoFocus returnKeyType="next" />
      </Field>
      <Field label="Limite">
        <AmountInput cents={limitCents} onChangeCents={setLimitCents} accessibilityLabel="Limite" />
      </Field>
      <Field label="Dia de vencimento da fatura">
        <ChipGroup>
          {DUE_DAY_SHORTCUTS.map((day) => (
            <Chip key={day} label={`Dia ${day}`} selected={dueDay === day} onPress={() => setDueDayText(String(day))} />
          ))}
        </ChipGroup>
        <TextField
          value={dueDayText}
          onChangeText={(t) => setDueDayText(t.replace(/\D/g, '').slice(0, 2))}
          keyboardType="number-pad"
          placeholder="Outro dia (1 a 31)"
        />
      </Field>
      <Field label="Dono do cartão">
        <MemberChips profiles={profiles} myProfileId={myProfileId} value={memberId} onChange={setMemberId} />
      </Field>
      <Field label="Cor">
        <ColorPicker options={COLORS} value={color} onChange={setColor} />
      </Field>
    </FormScreen>
  );
}
