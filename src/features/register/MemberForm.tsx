import { useState } from 'react';

import { createMemberProfile } from '@/api/createApi';
import { ColorPicker, EmojiPicker } from '@/components/ui/ColorPicker';
import { ErrorBanner, Field, FormScreen, PrimaryButton, TextField } from '@/components/ui/Form';
import { useReferenceData } from '@/features/catalog/ReferenceDataContext';
import { COLORS, MEMBER_EMOJIS } from '@/features/register/constants';
import { useCreateAction } from '@/features/register/useCreateAction';

// Creates a shared "correspondente" (e.g. Família, Casa) used to attribute
// transactions. It is not a new user: inviting a person is done on the web.
export function MemberForm() {
  const { household } = useReferenceData();
  const [displayName, setDisplayName] = useState('');
  const [emoji, setEmoji] = useState(MEMBER_EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const { submitting, error, run } = useCreateAction('member');

  const save = () =>
    run(
      () => {
        if (!household) return 'Lar não carregado. Volte e tente de novo.';
        if (!displayName.trim()) return 'Informe o nome.';
        return null;
      },
      () => createMemberProfile(household!.id, { displayName: displayName.trim(), emoji, color }),
    );

  return (
    <FormScreen
      title="Novo membro"
      footer={
        <>
          <ErrorBanner message={error} />
          <PrimaryButton title="Salvar membro" onPress={() => void save()} loading={submitting} />
        </>
      }
    >
      <Field label="Nome" hint="Um perfil para atribuir lançamentos (ex.: Família, Casa). Para convidar outra pessoa com login, use a versão web.">
        <TextField value={displayName} onChangeText={setDisplayName} placeholder="Ex.: Família" autoFocus />
      </Field>
      <Field label="Avatar">
        <EmojiPicker options={MEMBER_EMOJIS} value={emoji} onChange={setEmoji} />
      </Field>
      <Field label="Cor">
        <ColorPicker options={COLORS} value={color} onChange={setColor} />
      </Field>
    </FormScreen>
  );
}
