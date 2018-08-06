import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Popover from '../Popover';
import message from '../Message';
import Icon from '../Icon';
import { DatePicker } from '../DatePicker';
import { formatDate } from "../../utils/date/index";

// 默认快速选择时间选项
const defaultQuickTimeOption = [
  { text: '今天', value: new Date() },
  { text: '昨天', value: new Date(new Date()-24*60*60*1000) }
];

// value传进来有两种格式：{ text: '今天', value: new Date() } 或 Date
const getShowDateFromValue = (value, format) => {
  let result = { text: null, value: null };
  if(value instanceof Object && 'text' in value && 'value' in value) {
    result = value;
  }else if(value instanceof Date) {
    result = { text: `${formatDate(value, format)}`  , value: value};
  };
  return result;
};

class BizDatePicker extends React.Component {

  static propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    format: PropTypes.string,
    quickTimeOption: PropTypes.array,
    defaultValue: PropTypes.object,
    value: PropTypes.object,
    open: PropTypes.bool,               //用于手动控制浮层显隐
    disabled: PropTypes.bool,
    isShowTime: PropTypes.bool,
    disabledDate: PropTypes.func,
    onOpenChange: PropTypes.func,       //弹出或关闭浮层的回调
    onChange: PropTypes.func,
  }

  static defaultProps = {
    prefixCls: 'biz-date-picker',
    className: '',
    format: 'yyyy-MM-dd',
    quickTimeOption: defaultQuickTimeOption,
    defaultValue: defaultQuickTimeOption[0],
    open: false,
    disabled: false,
    isShowTime: false,
    disabledDate: () => {},
    onOpenChange: () => {},
    onChange: () => {},
  }

  constructor(props) {
    super(props);
    const value = props.value || props.defaultValue;
    this.state = {
      showDate: getShowDateFromValue(value, props.format),
      open: props.open
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value || [];
      this.setState({
        showDate: getShowDateFromValue(value, this.props.format) || this.state.showDate,
      });
    }
    if('open' in nextProps && this.props.open != nextProps.open){
      this.setState({
        open: nextProps.open,
      });
    }
  }

  // 快速时间选择
  handleQickTime(item) {
    this.setState({
      showDate: item,
      open: false,
    }, () => {
      this.props.onChange(this.state.showDate);
    });
  }

  // 自定义时间选择
  handleCustomerTimeChange = (date) => {
    // 不需要选时间时，直接关闭弹出层
    if(!this.props.showTime) {
      this.setState({
        open: false,
      });
    }

    this.setState({
      showDate: {
        text: formatDate(date, this.props.format),
        value: date
      },
    }, () => {
      this.props.onChange(this.state.showDate);
    });
  }

  // 打开、关闭Popover
  handleVisibleChange = (open) => {
    if(!this.props.disabled) {
      this.setState({ open }, () => {
        this.props.onOpenChange(open);
      });
    }
  }

  render() {
    const {
      className,
      prefixCls,
      quickTimeOption,
      disabled,
      disabledDate,
      format,
      isShowTime,
    } = this.props;
    const { showDate, open } = this.state;

    const clickAreaClass = classNames({
      [`${prefixCls}-click-area`]: true,
      'disabled': disabled
    });
    const clickAreaIconClass = classNames({
      [`${prefixCls}-click-area-icon`]: true,
      'icon-active': open
    });

    const content = (
      <div className={`${prefixCls}-content`}>
        {
          quickTimeOption.map((item, index) =>
            <li
              className={classNames("quick-picker-item", {"is-active": item.text === showDate.text})}
              key={`quick-item-${index}`}
              onClick={this.handleQickTime.bind(this, item)}>
              <span>{item.text}</span>
            </li>
          )
        }
        <li className={`${prefixCls}-customer-time`}>
          <DatePicker
            format={format}
            isShowTrigger={true}
            isAllowClear={false}
            isShowTime={isShowTime}
            disabledDate={disabledDate}
            onChange={this.handleCustomerTimeChange}
            placeholder="请选择日期"
            value={showDate.value}
          />
        </li>
      </div>
    );

    return (
      <div className={[`${prefixCls}-container`, className].join(' ')} >
        <Popover
          placement="bottomLeft"
          trigger="click"
          content={content}
          visible={open}
          onVisibleChange={this.handleVisibleChange}
          getPopupContainer={node => node.parentNode}
        >
          <div className={clickAreaClass}>
            <div className={`${prefixCls}-click-area-text`}>
              {showDate.text}
            </div>
            <div className={clickAreaIconClass} >
              <Icon
                className="iconfont"
                type="down-fill"
                onClick={this.handleClickCloseIcon}
              />
            </div>
          </div>
        </Popover>
      </div>
    );
  }
}

export default BizDatePicker;
