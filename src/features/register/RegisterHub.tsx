import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReferenceData } from '@/features/catalog/ReferenceDataContext';
import { colors, radius, spacing } from '@/theme';

type Item = { icon: string; title: string; subtitle: string; href: Href };

const count = (n: number, singular: string, plural: string) => (n === 0 ? 'Nenhuma ainda' : `${n} ${n === 1 ? singular : plural}`);

export function RegisterHub() {
  const insets = useSafeAreaInsets();
  const { categories, cards, accounts, profiles } = useReferenceData();
  const savingsCount = accounts.filter((a) => a.kind === 'Savings').length;
  const checkingCount = accounts.length - savingsCount;

  const sections: { title: string; items: Item[] }[] = [
    {
      title: 'Lançamentos',
      items: [
        { icon: '💸', title: 'Despesa', subtitle: 'À vista, parcelada no cartão ou fixa na conta', href: '/transaction/new?kind=expense' },
        { icon: '💰', title: 'Receita', subtitle: 'Única ou fixa; no cartão vira estorno', href: '/transaction/new?kind=income' },
        { icon: '🔁', title: 'Transferência', subtitle: 'Entre contas e para caixinhas', href: '/transaction/new?kind=transfer' },
      ],
    },
    {
      title: 'Cadastros',
      items: [
        { icon: '🏷️', title: 'Categoria', subtitle: count(categories.length, 'cadastrada', 'cadastradas'), href: '/register/category' },
        { icon: '💳', title: 'Cartão de crédito', subtitle: count(cards.length, 'cadastrado', 'cadastrados').replace('Nenhuma ainda', 'Nenhum ainda'), href: '/register/card' },
        { icon: '🏦', title: 'Conta', subtitle: count(checkingCount, 'cadastrada', 'cadastradas'), href: '/register/account' },
        { icon: '🐷', title: 'Caixinha', subtitle: count(savingsCount, 'cadastrada', 'cadastradas'), href: '/register/savings-box' },
        { icon: '👥', title: 'Membro', subtitle: count(profiles.length, 'no lar', 'no lar').replace('Nenhuma ainda', 'Nenhum ainda'), href: '/register/member' },
        { icon: '🎯', title: 'Orçamento', subtitle: 'Limite mensal por categoria', href: '/register/budget' },
      ],
    },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <Text style={styles.title}>Cadastrar</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Text style={styles.close}>Fechar</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + spacing.xl }]}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.title}
                  onPress={() => router.push(item.href)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.row, index > 0 && styles.divider, pressed && styles.pressed]}
                >
                  <Text style={styles.icon}>{item.icon}</Text>
                  <View style={styles.texts}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  close: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  body: { padding: spacing.md, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.track },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, minHeight: 64 },
  divider: { borderTopWidth: 1, borderTopColor: colors.track },
  pressed: { backgroundColor: colors.background },
  icon: { fontSize: 24, width: 32, textAlign: 'center' },
  texts: { flex: 1, paddingVertical: spacing.sm },
  rowTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  rowSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.textMuted },
});
