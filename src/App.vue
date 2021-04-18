<template>
  <div class="body">
    <div class="search">
      <input placeholder="例:儿子" /><button @click="changeOption">查询</button>
    </div>

    <div id="main" style="width: 100vw; height: 100vh"></div>
  </div>
</template>

<script>
import option from "/src/scripts/option.js";
import * as echarts from "echarts";
import { getData } from "/api/getdata.js";

//关系是数组，人物是对象
export default {
  created() {
    //页面渲染时即进行绑定
    getData("/data/Sun-Yat-sen_links.json").then((links) => {
      console.log(links);
      let outputLink = [];
      let uniqueLinkKey = new Set();
      links.forEach((x) => {
        let s = x.source;
        let t = x.target;
        let key = s < t ? s + "#" + t : t + "#" + s;
        let oriLength = uniqueLinkKey.size;
        uniqueLinkKey.add(key);
        if (oriLength !== uniqueLinkKey.size) {
          x.label = {
            show: true,
            formatter: x.relationName,
            color: "red",
          };
          console.log(x);
          outputLink.push(x);
        }
      });
      option.series[0].links = outputLink;

      getData("/data/Sun-Yat-sen.json").then((data) => {
        let outputData = [];
        let outputDataSet = new Set();
        outputLink.forEach((x) => {
          outputDataSet.add(x.source);
          outputDataSet.add(x.target);
        });
        let countObj = {};
        for (let key of outputDataSet) {
          countObj[key] = 50; //节点大小初始值
        }

        (function (num) {
          outputLink.forEach((x) => {
            if (x.relationType == "1") {
              countObj[x.source] -= num;
              countObj[x.target] += num;
            } else if (x.relationType == "3") {
              countObj[x.source] += num;
              countObj[x.target] -= num;
            }
          });
        })(10);
        console.log(countObj);
        for (let key of outputDataSet) {
          let item = {};
          item.id = key;
          item.name = data[key].name;
          item.symbolSize = countObj[key];
          item.draggable = true;
          item.value = `生日:${data[key].birth}`
          outputData.push(item);
        }
        option.series[0].data = outputData;
        this.data = outputData; //将关系涉及的节点保存下来
        this.links = links; //将所有的关系存下来，避免下次还需要访问
        this.mychart.setOption(this.myoption);
      });
    });
  },
  data() {
    return {
      myoption: option,
      links: [],
      data: [],
    };
  },
  computed: {
    //将该实例作为计算属性，进行保存
    mychart() {
      return echarts.init(document.getElementById("main"));
    },
    mydata() {
      return this.myoption.series[0].data;
    },
    mylinks() {
      return this.myoption.series[0].links;
    },
  },
  methods: {},
  watch: {
    //监听nowdata，nowdata修改时，自动渲染
    mydata() {
      this.mychart.setOption(this.myoption);
    },
    mylinks() {
      this.mychart.setOption(this.myoption);
    },
  },
};
</script>

<style>
body {
  background: oldlace;
}
#main {
  display: flex;
  justify-content: center;
}

.search {
  display: flex;
  justify-content: center;
  margin: 10vh 0 2vh 0;
  font-size: 20px;
}

.search input {
  font-size: 20px;
  border-radius: 5px 0 0 5px;
  border: 1px solid gray;
  padding: 3px;
}

.search button {
  font-size: inherit;
  border: 1px solid gray;
  border-radius: 0 5px 5px 0;
  background: hsla(0, 0%, 0%, 0.2);
}
.search input:focus {
  outline: none;
}

.search button:hover {
  cursor: pointer;
}

.search button:focus {
  outline: none;
}

.search button:active {
  background: hsla(0, 0%, 0%, 0.1);
}
</style>