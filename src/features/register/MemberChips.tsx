import { Text } from 'react-native';

import type { MemberProfile } from '@/api/catalogApi';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { colors } from '@/theme';

// Owner picker for cards and accounts. The user's own profile is listed first.
export function MemberChips({
  profiles,
  myProfileId,
  value,
  onChange,
}: {
  profiles: MemberProfile[];
  myProfileId: string | null;
  value: string | null;
  onChange: (id: string) => void;
}) {
  if (profiles.length === 0) {
    return <Text style={{ color: colors.textMuted }}>Nenhum membro cadastrado no lar.</Text>;
  }
  const ordered = [...profiles].sort((a, b) => Number(b.id === myProfileId) - Number(a.id === myProfileId));
  return (
    <ChipGroup>
      {ordered.map((p) => (
        <Chip
          key={p.id}
          icon={p.emoji}
          label={p.id === myProfileId ? `${p.displayName} (você)` : p.displayName}
          selected={p.id === value}
          onPress={() => onChange(p.id)}
        />
      ))}
    </ChipGroup>
  );
}
