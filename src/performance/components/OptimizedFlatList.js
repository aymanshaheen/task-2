import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  SectionList,
  View,
  ActivityIndicator,
  Platform,
} from "react-native";

const DEFAULT_ITEM_VISIBLE_PERCENT = 50;

export default function OptimizedFlatList(props) {
  const {
    data,
    sections,
    keyExtractor,
    renderItem,
    onEndReached,
    hasMore = false,
    loadingMore = false,
    onRefresh,
    refreshing = false,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    estimatedItemHeight,
    windowSize = 11,
    initialNumToRender = 12,
    maxToRenderPerBatch = 12,
    updateCellsBatchingPeriod = 16,
    removeClippedSubviews = true,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    scrollEventThrottle,
    contentContainerStyle,
    style,
  } = props;

  const visibleKeysRef = useRef(new Set());
  const [visibleVersion, setVisibleVersion] = useState(0);
  const rafRef = useRef(null);

  const getKey = useCallback(
    (item, index) => {
      if (typeof keyExtractor === "function") return keyExtractor(item, index);
      return item?.id ?? String(index);
    },
    [keyExtractor]
  );

  const isKeyVisible = useCallback((key) => {
    return visibleKeysRef.current.has(key);
  }, []);

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: DEFAULT_ITEM_VISIBLE_PERCENT,
      minimumViewTime: 50,
    }),
    []
  );

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const next = new Set();
    for (const v of viewableItems) {
      if (v?.key) next.add(v.key);
      else if (v?.item) next.add(v.item?.id ?? String(v.index));
    }
    visibleKeysRef.current = next;

    // Throttle state bumps to the next animation frame to avoid jank
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() =>
      setVisibleVersion((x) => x + 1)
    );
  }).current;

  const getItemLayout = useMemo(() => {
    if (!estimatedItemHeight) return undefined;
    return (_data, index) => ({
      length: estimatedItemHeight,
      offset: estimatedItemHeight * index,
      index,
    });
  }, [estimatedItemHeight]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || loadingMore || typeof onEndReached !== "function") return;
    onEndReached();
  }, [hasMore, loadingMore, onEndReached]);

  const footer = useMemo(() => {
    if (ListFooterComponent) return ListFooterComponent;
    if (!hasMore && !loadingMore) return null;
    return (
      <View style={{ paddingVertical: 12 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }, [ListFooterComponent, hasMore, loadingMore]);

  const commonProps = {
    onRefresh,
    refreshing,
    ListHeaderComponent,
    ListEmptyComponent,
    ListFooterComponent: footer,
    onEndReachedThreshold: 0.5,
    onEndReached: handleEndReached,
    windowSize,
    initialNumToRender,
    maxToRenderPerBatch,
    updateCellsBatchingPeriod,
    removeClippedSubviews,
    contentContainerStyle,
    style,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    scrollEventThrottle,
    viewabilityConfig,
    onViewableItemsChanged,
  };

  const renderItemWrapped = useCallback(
    ({ item, index, separators }) => {
      const key = getKey(item, index);
      const isVisible = isKeyVisible(key);
      return renderItem(
        { item, index, separators },
        { isItemVisible: isVisible }
      );
    },
    [getKey, isKeyVisible, renderItem, visibleVersion]
  );

  if (sections && Array.isArray(sections)) {
    return (
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => getKey(item, index)}
        renderItem={(args) => renderItemWrapped(args)}
        getItemLayout={getItemLayout}
        stickySectionHeadersEnabled={Platform.OS === "ios"}
        {...commonProps}
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => getKey(item, index)}
      renderItem={(args) => renderItemWrapped(args)}
      getItemLayout={getItemLayout}
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      {...commonProps}
    />
  );
}
