<template>
  <div class="body">
    <div class="search">
      <input
        placeholder="例:儿子"
        v-model="searchStr"
        @change="searchItem"
      /><button @click="searchItem">查询</button>
      <button id="addnode-btn" @click="isshowOfAdd = !isshowOfAdd">
        添加节点
      </button>
    </div>

    <div class="addnodebox" v-if="isshowOfAdd">
      <div>
        示例：<br />人物名称①-孙中山；<br />关系类型-子辈；<br />关系名称-儿子；<br />人物名称②-孙科
      </div>
      <div>
        <div class="inputNode">
          <p>人物名称①：</p>
          <input type="text" placeholder="孙中山" v-model="selfNode.fromName" />
        </div>
        <div class="inputNode">
          <p>关系类型：</p>
          <select
            name="relationType"
            v-model="selfNode.relationType"
            id="relationType"
          >
            <option value="1">父辈</option>
            <option value="2">同辈</option>
            <option value="3">子辈</option>
          </select>
        </div>
        <div class="inputNode">
          <p>关系名称：</p>
          <input
            v-model="selfNode.relationName"
            type="text"
            placeholder="儿子"
          />
        </div>
        <div class="inputNode">
          <p>人物名称②：</p>
          <input type="text" v-model="selfNode.toName" placeholder="孙科" />
        </div>
      </div>
      <button class="inputNode" @click="addNode">确定添加</button>
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
          x.symbolSize = [0, 10];
          outputLink.push(x);
        }
      });
      option.series[0].links = outputLink;

      getData("/data/Sun-Yat-sen.json").then((data) => {
        //输出数据
        let alldata = [];
        for (let key in data) {
          let item = {};
          item.id = key;
          item.name = data[key].name;
          item.draggable = true;
          item.category = data[key].category;
          item.value = `生日:${data[key].birth}`;
          alldata.push(item);
        }
        let outputData = [];
        //关系避免重复输出（单向），所以记录单一值
        let outputDataSet = new Set();
        outputLink.forEach((x) => {
          outputDataSet.add(x.source);
          outputDataSet.add(x.target);
        });
        //用于记录节点在数据中的关系次数
        let countObj = {};
        for (let key of outputDataSet) {
          countObj[key] = 50; //节点大小初始值
        }
        this.countObj = countObj;
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
        for (let key of outputDataSet) {
          let item = {};
          item.id = key;
          item.name = data[key].name;
          item.symbolSize = countObj[key];
          item.draggable = true;
          item.category = data[key].category;
          item.value = `生日:${data[key].birth}`;
          outputData.push(item);
        }
        let getCategories = (data) => {
          let categoriesSet = new Set();
          let categories = [];
          data.forEach((x) => {
            categoriesSet.add(x.category);
          });
          let cateArr = [...categoriesSet];
          cateArr.forEach((x) => {
            categories[x] = {
              name: x,
            };
          });
          return categories;
        };
        let categories = getCategories(outputData);
        option.categories = categories;
        option.series[0].data = outputData;
        this.originData = alldata;
        this.data = outputData; //将关系涉及的节点保存下来
        this.links = links; //将所有的关系存下来，避免下次还需要访问
        this.mychart.setOption(this.myoption);
        this.mychart.on("click", (params) => {
          this.searchStr = params.name;
          this.searchItem();
        });
      });
    });

    //绑定事件
  },
  data() {
    return {
      isshowOfAdd: false,
      selfNode: {
        fromName: "",
        relationType: "",
        relationName: "",
        toName: "",
      },
      myoption: option,
      links: [], //存获取的关系
      data: [], //存关系包含的节点
      searchStr: "孙科",
      countObj: {},
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
  methods: {
    addNode() {
      let data = this.data;
      // let links = this.outputLinks;
      let selfNode = this.selfNode;
      let fromId = "";
      let toId = "";
      data.forEach((x) => {
        if (x.name == selfNode.fromName) {
          fromId = x.id;
        } else if (x.name == selfNode.toName) {
          toId = x.id;
        }
      });
      let addLink = {};
      let addData = {};
      addData.symbolSize = 50;
      addLink.label = {
        show: true,
        color: "red",
      };
      addLink.symbolSize = [0, 10];
      let addData2 = {};
      if (fromId && toId) {
        console.log(1, fromId, toId);
        addLink.source = fromId;
        addLink.target = toId;
        addLink.relationName = selfNode.relationName;
        addLink.relationType = selfNode.relationType;
        addLink.label.formatter = selfNode.relationName;
      } else if (fromId && !toId) {
        toId = (Object.keys(this.originData).length + 1).toString();
        addData.id = toId;
        addData.name = selfNode.toName;
        addLink.source = fromId;
        addLink.target = toId;
        addLink.relationName = selfNode.relationName;
        addLink.relationType = selfNode.relationType;
        addLink.label.formatter = selfNode.relationName;
      } else if (!fromId && toId) {
        fromId = (Object.keys(this.originData).length + 1).toString();
        addData.id = fromId;
        addData.name = selfNode.fromName;
        addLink.source = fromId;
        addLink.target = toId;
        addLink.relationName = selfNode.relationName;
        addLink.relationType = selfNode.relationType;
        addLink.label.formatter = selfNode.relationName;
      } else {
        fromId = (Object.keys(this.originData).length + 1).toString();
        addData.id = fromId;
        addData.name = selfNode.fromName;
        toId = (Object.keys(this.originData).length + 2).toString();
        addData2.id = toId;
        addData2.id = toId;
        addData2.name = selfNode.toName;
        addLink.source = fromId;
        addLink.target = toId;
        addLink.relationName = selfNode.relationName;
        addLink.relationType = selfNode.relationType;
        addLink.label.formatter = selfNode.relationName;
      }
      this.data.push(addData);
      Object.keys(addData2).length != 0
        ? this.data.push(addData2)
        : console.log();
      this.links.push(addLink);
      console.log(this.links);
      this.myoption.series[0].data = this.data;
      this.myoption.series[0].links = this.links;
    },

    //查询
    searchItem() {
      let searchStr = this.searchStr;
      let data = this.data;
      let links = this.links;
      let outputLink = [];
      let outputData = [];
      let outputDataSet = new Set();
      if (searchStr) {
        let id = "";
        for (let value of data) {
          if (value.name == searchStr) {
            id = value.id;
            break;
          }
        }
        if (id) {
          links.forEach((x) => {
            if (x.source == id) {
              x.label = {
                show: true,
                formatter: x.relationName,
                color: "red",
              };
              x.symbolSize = [0, 10];
              outputLink.push(x);
            }
          });
        } else {
          console.log("没有相应的数据");
          return;
        }
        if (outputLink.length) {
          outputLink.forEach((x) => {
            outputDataSet.add(x.source);
            outputDataSet.add(x.target);
          });
          for (let key of outputDataSet) {
            for (let value of this.data) {
              value.id == key ? outputData.push(value) : console.log();
            }
          }
          this.myoption.series[0].data = outputData;
          this.myoption.series[0].links = outputLink;
        }
      } else {
        alert("请输入查询字段~");
      }
    },
  },
  watch: {
    //监听nowdata，nowdata修改时，自动渲染
    mydata() {
      this.mychart.setOption(this.myoption);
      this.mychart.on("click", (params) => {
        this.searchStr = params.name;
        this.searchItem();
      });
    },
    mylinks() {
      this.mychart.setOption(this.myoption);
      this.mychart.on("click", (params) => {
        this.searchStr = params.name;
        this.searchItem();
      });
    },
  },
};
</script>

<style>
.inputNode {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.addnodebox {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.addnodebox div {
  margin: 0 2vw;
}
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
  margin: 10vh 0 3vh 0;
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