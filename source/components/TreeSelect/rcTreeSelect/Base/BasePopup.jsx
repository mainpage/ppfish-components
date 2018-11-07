import React from 'react';
import PropTypes from 'prop-types';
import { polyfill } from 'react-lifecycles-compat';
import Tree from '../../rcTree';

export const popupContextTypes = {
  onPopupKeyDown: PropTypes.func.isRequired,
  onTreeNodeSelect: PropTypes.func.isRequired,
  onTreeNodeCheck: PropTypes.func.isRequired,
};

class BasePopup extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    upperSearchValue: PropTypes.string,
    valueList: PropTypes.array,
    valueEntities: PropTypes.object,
    keyEntities: PropTypes.object,
    treeIcon: PropTypes.bool,
    treeLine: PropTypes.bool,
    treeNodeFilterProp: PropTypes.string,
    treeCheckable: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.node,
    ]),
    treeCheckStrictly: PropTypes.bool,
    treeDefaultExpandAll: PropTypes.bool,
    treeDefaultExpandedKeys: PropTypes.array,
    loadData: PropTypes.func,
    multiple: PropTypes.bool,

    treeNodes: PropTypes.node,
    filteredTreeNodes: PropTypes.node,
    notFoundContent: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node,
    ]),

    ariaId: PropTypes.string,

    // HOC
    renderSearch: PropTypes.func,
    renderResetItem: PropTypes.func,
    onTreeExpanded: PropTypes.func,

    // 确定或取消选择
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
  };

  static contextTypes = {
    rcTreeSelect: PropTypes.shape({
      ...popupContextTypes,
    }),
  };

  constructor(props) {
    super();

    const {
      treeDefaultExpandAll, treeDefaultExpandedKeys,
      keyEntities,
    } = props;

    // TODO: make `expandedKeyList` control
    let expandedKeyList = treeDefaultExpandedKeys;
    if (treeDefaultExpandAll) {
      expandedKeyList = Object.keys(keyEntities);
    }

    this.state = {
      keyList: [],
      expandedKeyList,
      loadedKeys: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { prevProps = {}, loadedKeys } = prevState || {};
    const { valueList, valueEntities, keyEntities, filteredTreeNodes, upperSearchValue } = nextProps;

    const newState = {
      prevProps: nextProps,
    };

    // Check value update
    if (valueList !== prevProps.valueList) {
      newState.keyList = valueList
        .map(({ value }) => valueEntities[value])
        .filter(entity => entity)
        .map(({ key }) => key);
    }

    // 清空搜索内容后恢复搜索前的展开状态
    if (upperSearchValue && !prevState.savedExpandedKeyList) {
      // 保存搜索前展开的节点
      newState.prevExpandedKeyList = Array.isArray(prevState.expandedKeyList) ? [...prevState.expandedKeyList] : [];
      newState.savedExpandedKeyList = true;
    } else if (!upperSearchValue && prevState.savedExpandedKeyList) {
      // 恢复搜索前展开的节点
      newState.expandedKeyList = Array.isArray(prevState.prevExpandedKeyList) ? [...prevState.prevExpandedKeyList] : [];
      newState.savedExpandedKeyList = false;
    }

    // Show all when tree is in filter mode
    if (filteredTreeNodes && filteredTreeNodes.length && filteredTreeNodes !== prevProps.filteredTreeNodes) {
      newState.expandedKeyList = Object.keys(keyEntities);
    }

    // Clean loadedKeys if key not exist in keyEntities anymore
    if (nextProps.loadData) {
      newState.loadedKeys = loadedKeys.filter(key => key in keyEntities);
    }

    return newState;
  }

  onTreeExpand = (expandedKeyList) => {
    const { onTreeExpanded } = this.props;
    this.setState({ expandedKeyList }, onTreeExpanded);
  };

  onLoad = (loadedKeys) => {
    this.setState({ loadedKeys });
  };

  /**
   * This method pass to Tree component which is used for add filtered class
   * in TreeNode > li
   */
  filterTreeNode = (treeNode) => {
    const { upperSearchValue, treeNodeFilterProp } = this.props;

    const filterVal = treeNode.props[treeNodeFilterProp];
    if (typeof filterVal === 'string') {
      return upperSearchValue && (filterVal).toUpperCase().indexOf(upperSearchValue) !== -1;
    }

    return false;
  };

  renderNotFound = () => {
    const { prefixCls, notFoundContent } = this.props;

    return (
      <span className={`${prefixCls}-not-found`}>
        {notFoundContent}
      </span>
    );
  };

  render() {
    const { keyList, expandedKeyList, loadedKeys } = this.state;
    const {
      prefixCls,
      treeNodes, filteredTreeNodes,
      treeIcon, treeLine, treeCheckable, treeCheckStrictly, multiple,
      loadData,
      ariaId,
      renderSearch,
      renderResetItem
    } = this.props;
    const { rcTreeSelect: {
      onPopupKeyDown,
      onTreeNodeSelect,
      onTreeNodeCheck,
    } } = this.context;

    const treeProps = {};

    if (treeCheckable) {
      treeProps.checkedKeys = keyList;
    } else {
      treeProps.selectedKeys = keyList;
    }

    let $notFound;
    let $treeNodes;
    if (filteredTreeNodes) {
      if (filteredTreeNodes.length) {
        treeProps.checkStrictly = true;
        $treeNodes = filteredTreeNodes;
      } else {
        $notFound = this.renderNotFound();
      }
    } else if (!treeNodes.length) {
      $notFound = this.renderNotFound();
    } else {
      $treeNodes = treeNodes;
    }

    let $tree;
    let isNotFound = false;
    if ($notFound) {
      $tree = $notFound;
      isNotFound = true;
    } else {
      $tree = (
        <Tree
          prefixCls={`${prefixCls}-tree`}
          showIcon={treeIcon}
          showLine={treeLine}
          selectable={!treeCheckable}
          checkable={treeCheckable}
          checkStrictly={treeCheckStrictly}
          multiple={multiple}
          loadData={loadData}
          loadedKeys={loadedKeys}
          expandedKeys={expandedKeyList}
          filterTreeNode={this.filterTreeNode}
          onSelect={onTreeNodeSelect}
          onCheck={onTreeNodeCheck}
          onExpand={this.onTreeExpand}
          onLoad={this.onLoad}
          {...treeProps}
        >
          {$treeNodes}
        </Tree>
      );
    }

    return (
      <div
        className={`${prefixCls}-base-popup`}
        role="listbox"
        id={ariaId}
        onKeyDown={onPopupKeyDown}
        tabIndex={-1}
      >
        {renderSearch ? renderSearch() : null}
        {renderResetItem && !isNotFound ? renderResetItem() : null}
        {$tree}
      </div>
    );
  }
}

polyfill(BasePopup);

export default BasePopup;
