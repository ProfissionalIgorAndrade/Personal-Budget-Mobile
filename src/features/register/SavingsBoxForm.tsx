import { useState } from 'react';
import { Text } from 'react-native';

import { createSavingsBox } from '@/api/createApi';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { ErrorBanner, Field, FormScreen, PrimaryButton, TextField } from '@/components/ui/Form';
import { useReferenceData } from '@/features/catalog/ReferenceDataContext';
import { ACCOUNT_NAME_MAX_LENGTH } from '@/features/register/constants';
import { useCreateAction } from '@/features/register/useCreateAction';
import { colors } from '@/theme';

export function SavingsBoxForm() {
  const { accounts } = useReferenceData();
  // A savings box belongs to a checking account; it cannot hang from another box.
  const checking = accounts.filter((a) => a.kind !== 'Savings');
  const [parentAccountId, setParentAccountId] = useState<string | null>(checking.length === 1 ? checking[0].id : null);
  const [name, setName] = useState('');
  const { submitting, error, run } = useCreateAction('savingsBox');

  const save = () =>
    run(
      () => {
        if (!parentAccountId) return 'Selecione a conta da caixinha.';
        if (!name.trim()) return 'A caixinha precisa de um nome.';
        if (name.trim().length > ACCOUNT_NAME_MAX_LENGTH) return `O nome pode ter até ${ACCOUNT_NAME_MAX_LENGTH} caracteres.`;
        return null;
      },
      () => createSavingsBox({ parentAccountId: parentAccountId as string, name: name.trim() }),
    );

  return (
    <FormScreen
      title="Nova caixinha"
      footer={
        <>
          <ErrorBanner message={error} />
          <PrimaryButton title="Salvar caixinha" onPress={() => void save()} loading={submitting} />
        </>
      }
    >
      <Field label="Nome">
        <TextField value={name} onChangeText={setName} placeholder="Ex.: Reserva de emergência, Viagem" autoFocus />
      </Field>
      <Field label="Conta" hint="Guardar dinheiro na caixinha não conta como despesa.">
        {checking.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>Cadastre uma conta corrente primeiro.</Text>
        ) : (
          <ChipGroup>
            {checking.map((a) => (
              <Chip key={a.id} icon="🏦" label={a.displayName} selected={a.id === parentAccountId} onPress={() => setParentAccountId(a.id)} />
            ))}
          </ChipGroup>
        )}
      </Field>
    </FormScreen>
  );
}
