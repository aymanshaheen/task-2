import React, { useMemo } from "react";
import { SafeAreaView, View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { globalStyles } from "../../styles/globalStyles";
import { useNotes } from "../../hooks/useNotes";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { Card } from "../../components/Card";
import { SectionTitle } from "../../components/SectionTitle";
import { KeyValueRow } from "../../components/KeyValueRow";
import { formatRelativeTime } from "../../utils/dateHelpers";

export function StatsScreen() {
  const { themeStyles } = useTheme();
  const { notes } = useNotes();

  const stats = useMemo(() => {
    const total = notes.length;
    const favorites = notes.filter((n) => n.favorite).length;
    const pinned = notes.filter((n) => n.pinned).length;
    const tagsSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagsSet.add(t)));

    // compute additional insights
    const lastUpdated = notes.reduce<number | null>((acc, n) => {
      if (acc == null) return n.updatedAt;
      return Math.max(acc, n.updatedAt);
    }, null);

    // approximate word counts from HTML content
    const toPlain = (html: string) =>
      html
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim();

    const wordCounts = notes.map((n) => {
      const text = toPlain(n.content);
      if (!text) return 0;
      return text.split(/\s+/).length;
    });
    const totalWords = wordCounts.reduce((a, b) => a + b, 0);
    const avgWords = total ? Math.round(totalWords / total) : 0;

    const avgTags = total
      ? Math.round(
          (notes.reduce((sum, n) => sum + n.tags.length, 0) / total) * 10
        ) / 10
      : 0;
    const tagCount: Record<string, number> = {};
    notes.forEach((n) => {
      n.tags.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total,
      favorites,
      pinned,
      uniqueTags: tagsSet.size,
      lastUpdated,
      avgWords,
      avgTags,
      topTags,
    } as const;
  }, [notes]);

  return (
    <SafeAreaView
      style={[
        globalStyles.flex1,
        themeStyles.background,
        { paddingHorizontal: spacing.s16, marginTop: spacing.s4 },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.s20,
          paddingBottom: spacing.s20,
        }}
      >
        <Card>
          <SectionTitle>Overview</SectionTitle>
          <View style={styles.grid}>
            <View
              style={[
                styles.metric,
                { borderColor: themeStyles.colors.border },
              ]}
            >
              <Text
                style={[styles.metricValue, { color: themeStyles.colors.text }]}
              >
                {stats.total}
              </Text>
              <Text
                style={[styles.metricLabel, { color: themeStyles.colors.text }]}
              >
                Total notes
              </Text>
            </View>
            <View
              style={[
                styles.metric,
                { borderColor: themeStyles.colors.border },
              ]}
            >
              <Text
                style={[styles.metricValue, { color: themeStyles.colors.text }]}
              >
                {stats.favorites}
              </Text>
              <Text
                style={[styles.metricLabel, { color: themeStyles.colors.text }]}
              >
                Favorites
              </Text>
            </View>
            <View
              style={[
                styles.metric,
                { borderColor: themeStyles.colors.border },
              ]}
            >
              <Text
                style={[styles.metricValue, { color: themeStyles.colors.text }]}
              >
                {stats.pinned}
              </Text>
              <Text
                style={[styles.metricLabel, { color: themeStyles.colors.text }]}
              >
                Pinned
              </Text>
            </View>
            <View
              style={[
                styles.metric,
                { borderColor: themeStyles.colors.border },
              ]}
            >
              <Text
                style={[styles.metricValue, { color: themeStyles.colors.text }]}
              >
                {stats.uniqueTags}
              </Text>
              <Text
                style={[styles.metricLabel, { color: themeStyles.colors.text }]}
              >
                Unique tags
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ height: spacing.s16 }} />

        <Card>
          <SectionTitle>Activity</SectionTitle>
          <View style={{ gap: spacing.s8 }}>
            <KeyValueRow
              label="Last update"
              value={
                stats.lastUpdated ? formatRelativeTime(stats.lastUpdated) : "—"
              }
            />
            <KeyValueRow
              label="Average words/note"
              value={String(stats.avgWords)}
            />
            <KeyValueRow
              label="Average tags/note"
              value={String(stats.avgTags)}
            />
          </View>
        </Card>

        {stats.topTags.length > 0 && (
          <>
            <View style={{ height: spacing.s16 }} />
            <Card>
              <SectionTitle>Top tags</SectionTitle>
              <View style={styles.chipsContainer}>
                {stats.topTags.map(([tag, count]) => (
                  <View
                    key={tag}
                    style={[
                      styles.chip,
                      {
                        borderColor: themeStyles.colors.chipBorder,
                        backgroundColor: themeStyles.colors.chipBg,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: themeStyles.colors.text,
                        fontSize: typography.size.sm,
                      }}
                    >
                      #{tag}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: themeStyles.colors.primary },
                      ]}
                    >
                      <Text
                        style={{
                          color: themeStyles.colors.white,
                          fontSize: typography.size.xs,
                        }}
                      >
                        {count}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: { text: string; muted: string; border: string } & Record<string, any>;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ color: color.muted, fontSize: typography.size.sm }}>
        {label}
      </Text>
      <Text style={{ color: color.text, fontWeight: typography.weight.medium }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s12,
  },
  metric: {
    flexGrow: 1,
    minWidth: "45%",
    padding: spacing.s12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: spacing.s10,
  },
  metricValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  metricLabel: {
    marginTop: spacing.s4,
    fontSize: typography.size.sm,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s8,
    paddingVertical: spacing.s6,
    paddingHorizontal: spacing.s10,
    borderRadius: spacing.s16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    paddingHorizontal: spacing.s6,
    paddingVertical: spacing.s2,
    borderRadius: spacing.s12,
  },
});
