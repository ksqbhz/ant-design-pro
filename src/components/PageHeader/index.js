import React, { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Tabs } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const { TabPane } = Tabs;

function getBreadcrumb(breadcrumbNameMap, url) {
  // 在routerData里找一遍
  let breadcrumb = {};
  let breadArray = [];
  const urlWithoutSplash = url.replace(/\/$/, '');

  if (breadcrumbNameMap[url]) {
    // breadArray = breadcrumbNameMap[url].breadcrumb.concat();
    return breadcrumbNameMap[url];
  } else if (breadcrumbNameMap[urlWithoutSplash]) {
  // 去掉结尾 / 再找一遍
  //   breadArray = breadcrumbNameMap[urlWithoutSplash].breadcrumb.concat();
    return breadcrumbNameMap[urlWithoutSplash];
  } else {

    // 校验map中是否有与url匹配的属性 再找一次
    Object.keys(breadcrumbNameMap).forEach((item) => {
      const itemRegExpStr = `^${item.replace(/:[\w-]+/g, '[\\w-]+')}$`;
      const itemRegExp = new RegExp(itemRegExpStr);
      if (itemRegExp.test(url)) {
        // breadArray = breadcrumbNameMap[item].breadcrumb.concat();
        breadcrumb = breadcrumbNameMap[item];
      }
    });
  }

  return breadcrumb;
}

export default class PageHeader extends PureComponent {
  static contextTypes = {
    routes: PropTypes.array,
    params: PropTypes.object,
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };
  onChange = (key) => {
    if (this.props.onTabChange) {
      this.props.onTabChange(key);
    }
  };
  getBreadcrumbProps = () => {
    return {
      routes: this.props.routes || this.context.routes,
      params: this.props.params || this.context.params,
      location: this.props.location || this.context.location,
      breadcrumbNameMap: this.props.breadcrumbNameMap || this.context.breadcrumbNameMap,
    };
  };
  itemRender = (route, params, routes, paths) => {
    const { linkElement = 'a' } = this.props;
    const last = routes.indexOf(route) === routes.length - 1;
    return (last || !route.component)
      ? <span>{route.breadcrumbName}</span>
      : createElement(linkElement, {
        href: paths.join('/') || '/',
        to: paths.join('/') || '/',
      }, route.breadcrumbName);
  }
  render() {
    const { routes, params, location, breadcrumbNameMap } = this.getBreadcrumbProps();
    const {
      title, logo, action, content, extraContent,
      breadcrumbList, tabList, className, linkElement = 'a',
      tabActiveKey,
    } = this.props;
    const clsString = classNames(styles.pageHeader, className);
    let breadcrumb;
    if (breadcrumbList && breadcrumbList.length) {
      breadcrumb = (
        <Breadcrumb className={styles.breadcrumb}>
          {
            breadcrumbList.map(item => (
              <Breadcrumb.Item key={item.title}>
                {item.href ? (
                  createElement(linkElement, {
                    [linkElement === 'a' ? 'href' : 'to']: item.href,
                  }, item.title)
                ) : item.title}
              </Breadcrumb.Item>)
            )
          }
        </Breadcrumb>
      );
    } else if (routes && params) {
      breadcrumb = (
        <Breadcrumb
          className={styles.breadcrumb}
          routes={routes.filter(route => route.breadcrumbName)}
          params={params}
          itemRender={this.itemRender}
        />
      );
    } else if (location && location.pathname) {
      const pathSnippets = location.pathname.split('/').filter(i => i);
      // 获取面包屑
      const extraBreadcrumbItems = pathSnippets.map((_, index) => {

        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        const currentBreadcrumb = getBreadcrumb(breadcrumbNameMap, url);
        const isLinkable = (index !== pathSnippets.length - 1);

        return currentBreadcrumb.breadcrumb? currentBreadcrumb.breadcrumb.map( item => (
          <Breadcrumb.Item key={url}>
            {createElement(
              (isLinkable && item.component) ? linkElement : 'span',
              { [linkElement === 'a' ? 'href' : 'to']: url },
              item.name,
            )}
          </Breadcrumb.Item>
         )): currentBreadcrumb.name && !currentBreadcrumb.hideInBreadcrumb ? (
          <Breadcrumb.Item key={url}>
            {createElement(
              (isLinkable && currentBreadcrumb.component)? linkElement : 'span',
              { [linkElement === 'a' ? 'href' : 'to']: url },
              currentBreadcrumb.name,
            )}
          </Breadcrumb.Item>
        ) : null;

      });

      console.info(extraBreadcrumbItems);
      const breadcrumbItems = [(
        <Breadcrumb.Item key="home">
          {createElement(linkElement, {
            [linkElement === 'a' ? 'href' : 'to']: '/',
          }, '首页')}
        </Breadcrumb.Item>
      )].concat(extraBreadcrumbItems);
      breadcrumb = (
        <Breadcrumb className={styles.breadcrumb}>
          {breadcrumbItems}
        </Breadcrumb>
      );
    } else {
      breadcrumb = null;
    }

    let tabDefaultValue;
    if (tabActiveKey !== undefined && tabList) {
      tabDefaultValue = tabList.filter(item => item.default)[0] || tabList[0];
    }

    const activeKeyProps = {
      defaultActiveKey: tabDefaultValue && tabDefaultValue.key,
    };
    if (tabActiveKey !== undefined) {
      activeKeyProps.activeKey = tabActiveKey;
    }

    return (
      <div className={clsString}>
        {breadcrumb}
        <div className={styles.detail}>
          {logo && <div className={styles.logo}>{logo}</div>}
          <div className={styles.main}>
            <div className={styles.row}>
              {title && <h1 className={styles.title}>{title}</h1>}
              {action && <div className={styles.action}>{action}</div>}
            </div>
            <div className={styles.row}>
              {content && <div className={styles.content}>{content}</div>}
              {extraContent && <div className={styles.extraContent}>{extraContent}</div>}
            </div>
          </div>
        </div>
        {
          tabList &&
          tabList.length && (
            <Tabs
              className={styles.tabs}
              {...activeKeyProps}
              onChange={this.onChange}
            >
              {
                tabList.map(item => <TabPane tab={item.tab} key={item.key} />)
              }
            </Tabs>
          )
        }
      </div>
    );
  }
}
