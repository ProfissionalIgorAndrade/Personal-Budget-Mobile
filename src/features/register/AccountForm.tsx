import { useEffect, useState } from 'react';

import { createAccount } from '@/api/createApi';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { ErrorBanner, Field, FormScreen, PrimaryButton, TextField } from '@/components/ui/Form';
import { useReferenceData } from '@/features/catalog/ReferenceDataContext';
import { ACCOUNT_NAME_MAX_LENGTH, BANKS } from '@/features/register/constants';
import { MemberChips } from '@/features/register/MemberChips';
import { useCreateAction } from '@/features/register/useCreateAction';

export function AccountForm() {
  const { profiles, myProfileId } = useReferenceData();
  const [bank, setBank] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState<string | null>(myProfileId);
  const { submitting, error, run } = useCreateAction('account');

  useEffect(() => {
    if (!memberId && myProfileId) setMemberId(myProfileId);
  }, [memberId, myProfileId]);

  const save = () =>
    run(
      () => {
        if (!bank) return 'Selecione o banco.';
        if (!memberId) return 'Selecione o membro da família dono da conta.';
        if (name.trim().length > ACCOUNT_NAME_MAX_LENGTH) return `O apelido pode ter até ${ACCOUNT_NAME_MAX_LENGTH} caracteres.`;
        return null;
      },
      () =>
        createAccount({
          bank: bank as string,
          memberId: memberId as string,
          ...(name.trim() ? { name: name.trim() } : {}),
        }),
    );

  return (
    <FormScreen
      title="Nova conta"
      footer={
        <>
          <ErrorBanner message={error} />
          <PrimaryButton title="Salvar conta" onPress={() => void save()} loading={submitting} />
        </>
      }
    >
      <Field label="Banco">
        <ChipGroup>
          {BANKS.map((b) => (
            <Chip key={b.value} label={b.label} color={b.color} selected={b.value === bank} onPress={() => setBank(b.value)} />
          ))}
        </ChipGroup>
      </Field>
      <Field label="Apelido (opcional)" hint="Para diferenciar contas do mesmo banco. Ex.: Conta salário.">
        <TextField value={name} onChangeText={setName} placeholder="Ex.: Conta salário" maxLength={ACCOUNT_NAME_MAX_LENGTH} />
      </Field>
      <Field label="Dono da conta">
        <MemberChips profiles={profiles} myProfileId={myProfileId} value={memberId} onChange={setMemberId} />
      </Field>
    </FormScreen>
  );
}
