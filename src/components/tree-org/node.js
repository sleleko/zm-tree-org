const EVENTS = {
  CLICK: 'on-node-click',
  CONTEXTMENU: 'on-node-contextmenu',
  MOUSEENTER: 'on-node-mouseenter',
  MOUSELEAVE: 'on-node-mouseleave'
}

function createListener (handler, data) {
  if (typeof handler === 'function') {
    return function (e) {
      if (e.target.className.indexOf('org-tree-node-btn') > -1) return

      handler.apply(null, [e, data])
    }
  }
}
// 判断是否叶子节点
const isLeaf = (data, prop) => {
  return !(Array.isArray(data[prop]) && data[prop].length > 0)
}

// 创建 node 节点
export const renderNode = (h, data, context, root) => {
  const { props } = context;
  const cls = ['tree-org-node']
  const childNodes = []
  const children = data[props.props.children]
  // 如果是叶子节点则追加leaf事件
  if (isLeaf(data, props.props.children)) {
    cls.push('is-leaf')
  } else if (props.collapsable && !data[props.props.expand]) { // 追加是否展开class
    cls.push('collapsed')
  }
  if(data.moving) {
    cls.push('tree-org-node-moving')
  }
  // 渲染label块
  childNodes.push(renderLabel(h, data, context, root))

  if (!props.collapsable || data[props.props.expand]) {
    childNodes.push(renderChildren(h, children, context))
  }
  return h('div', {
    'class': cls,
    'key': data[props.props.id],
    'directives' :[ {
      name: 'show',
      value: !data.hidden
    }]
  }, childNodes)
}

// 创建展开折叠按钮
export const renderBtn = (h, data, { props, listeners }) => {
  const expandHandler = listeners['on-expand']

  let cls = ['tree-org-node-btn']

  if (data[props.props.expand]) {
    cls.push('expanded')
  }

  return h('span', {
    'class': cls,
    on: {
      click: e => expandHandler && expandHandler(e, data)
    }
  })
}

// 创建 label 节点
export const renderLabel = (h, data, context, root) => {
  const { props, listeners } = context
  const label = data[props.props.label]
  const renderContent = props.renderContent
  const { directives } = context.data;

  const childNodes = []
  if (typeof renderContent === 'function') {
    let vnode = renderContent(h, data)

    vnode && childNodes.push(vnode)
  } else {
    childNodes.push(label)
  }

  if (props.collapsable && !isLeaf(data, props.props.children)) {
    childNodes.push(renderBtn(h, data, context))
  }

  const cls = ['tree-org-node-label-inner']
  let { labelStyle, labelClassName, selectedClassName, selectedKey } = props

  if (typeof labelClassName === 'function') {
    labelClassName = labelClassName(data)
  }

  labelClassName && cls.push(labelClassName)
  data.className && cls.push(data.className)
  // add selected class and key from props
  if (typeof selectedClassName === 'function') {
    selectedClassName = selectedClassName(data)
  }

  selectedClassName && selectedKey && data[selectedKey] && cls.push(selectedClassName)
  const nodeLabelClass = ['tree-org-node-label'];
  if (root) {
    nodeLabelClass.push('root-tree-org-node-label')
  } else if (data.newNode){
    nodeLabelClass.push('new-tree-org-node-label')
  }
  // directives
  let cloneDirs 
  if(Array.isArray(directives)){
    cloneDirs = directives.map(item=>{
      const newValue = Object.assign({node: data}, item.value)
      return Object.assign({...item}, {value: newValue})
    })
  }
  // event handlers
  const NODEEVENTS = {};
  for (let EKEY in EVENTS){
    if (Object.prototype.hasOwnProperty.call(EVENTS,EKEY)){
      const EVENT = EVENTS[EKEY];
      let handler = listeners[EVENT];
      if(handler){
        NODEEVENTS[EKEY.toLowerCase()] = createListener(handler, data);
      }
    }
  }
  // texterea event handles
  const focusHandler = listeners['on-node-focus']
  const blurHandler = listeners['on-node-blur']
  return h('div', {
    'class': nodeLabelClass,
    'directives': root? [] : cloneDirs,
  }, [h('div', {
    'class': cls,
    style: data['style'] ? data['style'] : labelStyle,
    on: NODEEVENTS
  }, childNodes), h('textarea', {
    'class': "tree-org-node-textarea",
    'directives' :[{
      name: 'show',
      value: data.focused
    }, {
      name: 'focus',
      value: data.focused
    }],
    "domProps":{
      placeholder: "请输入节点名称",
      value: data[props.props.label],
    },
    on: {
      focus: e => focusHandler && focusHandler(e, data),
      input: e => { data[props.props.label] = e.target.value },
      blur: e => { data.focused = false; blurHandler && blurHandler(e, data)},
      click: e => e.stopPropagation()
    }
  })])
}

// 创建 node 子节点
export const renderChildren = (h, list, context) => {
  if (Array.isArray(list) && list.length) {
    const children = list.map(item => {
      return renderNode(h, item, context, false)
    })

    return h('div', {
      'class': 'tree-org-node-children'
    }, children)
  }
  return ''
}

export const render = (h, context) => {
  const { props } = context
  props.data.root = true;
  return renderNode(h, props.data, context, true)
}

export default render