let option = {
  tooltip: {},
  width:"90vw",
  height:"90vh",
  animationDurationUpdate: 1500,
  animationEasingUpdate: "quinticInOut",
  color: ["#83e0ff", "#45f5ce", "#b158ff"],
  series: [{
    type: "graph",
    layout: "force",
    force: {
      repulsion: 1000,
      edgeLength: 150,
      initLayout: "force",
    },
    edgeSymbol: ['circle', 'arrow'],
    edgeSymbolSize: [0, 10],
    roam: "move",
    label: {
      show: true
    },
    lineStyle: {
      opacity: 0.5,
      width: 3,
      curveness: 0,
    },

  }]
};

export default option;