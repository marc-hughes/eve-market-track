import { useState, useCallback, useEffect } from 'react';
import isEqual from 'react-fast-compare';

type SortDirection = 'asc' | 'desc';
type Sort = {
  sort: SortDirection;
  field: string;
};
export type SortModel = Sort[];

const compareFields =
  <T>(sortModel: SortModel) =>
  (a: any, b: any) => {
    // TODO: maybe support multiple sort fields
    const sort = sortModel[0];
    if (a[sort.field] === b[sort.field]) {
      return 0;
    }
    if (sort.sort === 'asc') {
      return a[sort.field] > b[sort.field] ? 1 : -1;
    }
    if (sort.sort === 'desc') {
      return a[sort.field] < b[sort.field] ? 1 : -1;
    }
  };

interface UsePaginationHookResult<T> {
  setList: (list: T[]) => void;
  setCurrentItem: (item: T) => void;
  onSortModelChange: (sortModel: SortModel) => void;
  count: number;
  currentItem: T;
  next: () => void;
  previous: () => void;
  currentList: T[];
  currentIndex: number;
}

export const usePagination = <T>(
  initialValue: T[]
): UsePaginationHookResult<T> => {
  const [currentList, setCurrentList] = useState(initialValue);
  const [sortedList, setSortedList] = useState(initialValue);
  const [currentItemIndex, setCurrentItemIndex] = useState(-1);
  const [sortModel, setSortModel] = useState<SortModel>(null);

  const sortList = (list: T[], sortModel: SortModel) => {
    if (!sortModel || sortModel.length === 0) {
      return list;
    }
    return [...list].sort(compareFields(sortModel));
  };

  const next = () => {
    console.info('pagination.next');
    if (
      currentItemIndex === -1 ||
      currentItemIndex === currentList.length - 1
    ) {
      return;
    }
    setCurrentItemIndex(currentItemIndex + 1);
  };

  const previous = () => {
    console.info('pagination.prev');
    if (currentItemIndex === -1 || currentItemIndex === 0) {
      return;
    }
    setCurrentItemIndex(currentItemIndex - 1);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.key === 'ArrowLeft' && previous();
      event.key === 'ArrowRight' && next();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [next, previous]);

  const setCurrentItem = (obj: T) => {
    console.info('pagination.setcurrentitem');
    const index = sortedList.indexOf(obj);
    setCurrentItemIndex(index);
  };

  const onSortModelChange = useCallback(
    (newSort: SortModel) => {
      console.info('pagination.onsortmodelchange', newSort, sortModel);
      if (isEqual(newSort, sortModel)) {
        return;
      }
      setSortModel(newSort);
      setSortedList(sortList(currentList, newSort));
    },
    [sortModel, currentList]
  );

  const setList = (list: T[]) => {
    console.info('pagination.setlist');
    setCurrentList(list);
    setSortedList(sortList(list, sortModel));
  };

  return {
    currentList,
    setList,
    setCurrentItem,
    onSortModelChange,
    count: currentList.length,
    currentItem: sortedList[currentItemIndex],
    currentIndex: currentItemIndex,
    next,
    previous
  };
};
