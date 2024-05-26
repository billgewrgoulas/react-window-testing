import { Children, CSSProperties, useCallback, useMemo, useState } from "react";
import "./App.css";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from "react-window";

import AutoSizer from "react-virtualized-auto-sizer";
import {
  Stack,
  DetailsRow,
  Selection,
  SelectionMode,
  IObjectWithKey,
  Text,
  Icon,
} from "@fluentui/react";

const columns: any = [
  { key: "name", name: "Name", fieldName: "name" },
  { key: "mixas", name: "mixas", fieldName: "mixas" },
];

interface IHeader {
  name: string;
  index: number;
  groupId: string;
  isLoading: boolean;
  mixas: string;
  onClick: any;
  style?: CSSProperties;
  selection?: Selection<IObjectWithKey>;
  children?: IHeader[];
}

interface IGroup {
  groupId: string;
  expanded: boolean;
  children: IHeader[];
  isLoading: boolean;
  key: string;
  type: string;
  name: string;
}

const groupData: IGroup[] = [
  {
    groupId: "group1",
    expanded: false,
    key: "group1",
    name: "Header 1",
    type: "group",
    isLoading: false,
    children: [],
  },
  {
    groupId: "group2",
    expanded: false,
    isLoading: false,
    key: "group2",
    name: "Header 1",
    type: "group",
    children: [],
  },
  {
    groupId: "group3",
    isLoading: false,
    expanded: false,
    key: "group3",
    name: "Header 1",
    type: "group",
    children: [],
  },
];

const flattenedItems = [
  {
    key: "group1",
    name: "Header 1",
    type: "group",
  },
  {
    key: "group2",
    name: "Header 2",
    type: "group",
  },
  {
    key: "group3",
    name: "Header 3",
    type: "group",
  },
];

const Row = ({ name, style, groupId, index, selection, mixas }: IHeader) => (
  <Stack horizontal horizontalAlign="start" style={style}>
    <DetailsRow
      itemIndex={index}
      columns={columns}
      selectionMode={SelectionMode.single}
      selection={selection}
      item={{ name, groupId, mixas }}
      checkboxVisibility={1}
    />
  </Stack>
);

const Header = ({
  name,
  style,
  groupId,
  index,
  selection,
  mixas,
  isLoading,
  onClick,
}: IHeader) => (
  <Stack
    key={groupId}
    horizontal
    horizontalAlign="start"
    verticalAlign="center"
    onClick={() => onClick(groupId)}
    tokens={{ childrenGap: 10 }}
    style={{
      ...style,
      paddingInline: "20px",
      backgroundColor: "aliceblue",
      cursor: "pointer",
    }}
  >
    <Icon iconName="IncreaseIndentArrow" />
    <Text>{isLoading ? "loading..." : name}</Text>
  </Stack>
);

function ExampleWrapper({
  // Are there more items to load?
  // (This information comes from the most recent API request.)
  hasNextPage,

  // Are we currently loading a page of items?
  // (This may be an in-flight flag in your Redux store for example.)
  isNextPageLoading,

  // Array of items loaded so far.
  items,

  // Callback function responsible for loading the next page of items.
  loadNextPage,

  onHeaderClick,
}: any) {
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? items.length + 1 : items.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = (index: number) => !hasNextPage || index < items.length;

  const selection = new Selection({ items });

  // Render an item or a loading indicator.
  const Item = ({ index, style }: any) => {
    let content;
    if (!isItemLoaded(index)) {
      content = "Loading...";
    } else {
      content = items[index].name;
    }

    return (
      <>
        {items[index]?.type === "group" ? (
          <Header
            groupId={items[index]?.key}
            index={items[index]?.index}
            mixas={items[index]?.mixas}
            isLoading={items[index]?.isLoading}
            name={content}
            style={style}
            selection={selection}
            onClick={onHeaderClick}
          />
        ) : (
          <Row
            groupId={items[index]?.key}
            isLoading={false}
            index={items[index]?.index}
            mixas={items[index]?.mixas}
            name={content}
            style={style}
            selection={selection}
            onClick={onHeaderClick}
          />
        )}
      </>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }: { width: number; height: number }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadNextPage}
        >
          {({ onItemsRendered, ref }) => (
            <List
              className="List"
              height={height}
              itemCount={itemCount}
              itemSize={46}
              onItemsRendered={onItemsRendered}
              ref={ref}
              width={width}
            >
              {Item}
            </List>
          )}
        </InfiniteLoader>
      )}
    </AutoSizer>
  );
}

function App() {
  const [state, setState] = useState({
    hasNextPage: false,
    isNextPageLoading: false,
    items: groupData,
  });

  const onHeaderClick = useCallback(
    (groupId: string) => {
      const group = groupData.find((group) => group.groupId === groupId);

      if (!group) {
        return;
      }

      if (group.expanded) {
        group.expanded = false;

        setState((state) => ({
          hasNextPage: false,
          isNextPageLoading: false,
          items: [...groupData],
        }));
      } else {
        group.expanded = true;
        // setState((state) => ({ ...state, isNextPageLoading: true }));

        group.isLoading = true;

        setState((state) => ({
          hasNextPage: false,
          isNextPageLoading: false,
          items: [...groupData],
        }));

        setTimeout(() => {
          const nextItems = new Array(1000).fill(true).map((_, index) => ({
            name: "mixas",
            key: "mixas" + state.items.length + index,
            mixas: "MIXAS",
          }));

          let updatedGroupItems = [...group.children, ...nextItems] as any;

          group.children = updatedGroupItems as any[];
          setState((state) => ({
            hasNextPage: false,
            isNextPageLoading: false,
            items: [...groupData],
          }));
          group.isLoading = false;
        }, 1000);
      }
    },
    [state.items]
  );

  const loadNextGroup = useCallback((...args: any) => {
    console.log(`Loading next group`);
    // setState((state) => ({ ...state, isNextPageLoading: true }));
    // setTimeout(() => {
    //   setState((state) => ({
    //     hasNextPage: state.items.length < 100,
    //     isNextPageLoading: false,
    //     items: [...state.items].concat(
    //       new Array(100).fill(true).map((_, index) => ({
    //         name: "mixas",
    //         key: "mixas" + state.items.length + index,
    //         index: state.items.length + index,
    //         mixas: "MIXAS",
    //       })) as any
    //     ),
    //   }));
    // }, 1000);
  }, []);

  const items: any = useMemo(() => {
    const flattenedItems = [];

    for (let i = 0; i < state.items.length; i++) {
      flattenedItems.push(state.items[i]);

      if (!state.items[i].expanded) {
        continue;
      }

      for (let j = 0; j < state.items[i].children.length; j++) {
        flattenedItems.push(state.items[i].children[j]);
      }
    }

    return flattenedItems;
  }, [state.items]);

  console.log(state.items);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ height: "70%", width: "70%", border: "1px solid red" }}>
        <ExampleWrapper
          hasNextPage={state.hasNextPage}
          isNextPageLoading={state.isNextPageLoading}
          items={items}
          loadNextPage={loadNextGroup}
          onHeaderClick={onHeaderClick}
        />
      </div>
    </div>
  );
}

export default App;
