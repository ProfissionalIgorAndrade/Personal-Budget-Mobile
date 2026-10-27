import { useState } from 'react';

import { createCategory } from '@/api/createApi';
import type { CategoryType } from '@/api/catalogApi';
import { ColorPicker, EmojiPicker } from '@/components/ui/ColorPicker';
import { ErrorBanner, Field, FormScreen, PrimaryButton, TextField } from '@/components/ui/Form';
import { Segmented } from '@/components/ui/Segmented';
import { CATEGORY_ICONS, COLORS } from '@/features/register/constants';
import { useCreateAction } from '@/features/register/useCreateAction';
import { colors } from '@/theme';

export function CategoryForm({ initialType }: { initialType?: CategoryType }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(initialType ?? 'Expense');
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const { submitting, error, run } = useCreateAction('category');

  const save = () =>
    run(
      () => (name.trim() ? null : 'Informe o nome da categoria.'),
      () => createCategory({ name: name.trim(), type, icon, color }),
    );

  return (
    <FormScreen
      title="Nova categoria"
      footer={
        <>
          <ErrorBanner message={error} />
          <PrimaryButton title="Salvar categoria" onPress={() => void save()} loading={submitting} />
        </>
      }
    >
      <Field label="Tipo">
        <Segmented
          options={[
            { value: 'Expense', label: 'Despesa', color: colors.expense },
            { value: 'Income', label: 'Receita', color: colors.income },
          ]}
          value={type}
          onChange={setType}
        />
      </Field>
      <Field label="Nome">
        <TextField value={name} onChangeText={setName} placeholder="Ex.: Alimentação" autoFocus returnKeyType="done" />
      </Field>
      <Field label="Ícone">
        <EmojiPicker options={CATEGORY_ICONS} value={icon} onChange={setIcon} />
      </Field>
      <Field label="Cor">
        <ColorPicker options={COLORS} value={color} onChange={setColor} />
      </Field>
    </FormScreen>
  );
}
