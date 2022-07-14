<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button> </el-input
        ></el-col>
        <el-col>
          <el-button type="primary" @click="goaddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- //添加用户结构 -->
      <!-- <el-dialog
        title="添加用户"
        :visible.sync="dialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <el-form :model="addGoodsForm" ref="addGoodsFormRef" label-width="70px">
          <el-form-item prop="goods_name" label="商品名称">
            <el-input v-model="addGoodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item prop="goods_price" label="商品价格（元）">
            <el-input
              v-model="addGoodsForm.goods_price"
            ></el-input> </el-form-item
          ><el-form-item prop="goods_weight" label="商品重量">
            <el-input
              v-model="addGoodsForm.goods_weight"
            ></el-input> </el-form-item
          ><el-form-item prop="add_time" label="创建时间">
            <el-input v-model="addGoodsForm.add_time"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addGoods">确 定</el-button>
        </span>
      </el-dialog> -->

      <el-table :data="goodlist" stripe border style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）" width="95px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-row>
              <el-button type="primary" icon="el-icon-edit" circle></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                @click="removeGoodById(scope.row.id)"
              ></el-button>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      goodlist: [],
      total: 0,
      // addGoodsForm: {
      //   goods_name: "",
      //   goods_price: "",
      //   goods_weight: "",
      //   add_time: "",
      // },
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      this.$message.success("获取商品列表成功");
      this.goodlist = res.data.goods;
      this.total = res.data.total;
      console.log(res.data);
    },
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // addDialogClosed() {
    //   this.$refs.addGoodsFormRef.resetFields();
    // },
    // addGoods() {
    //   this.$refs.addGoodsFormRef.validate(async (valid) => {
    //     if (!valid) return;
    //     // 可以发起添加用户的网络请求
    //     const { data: res } = await this.$http.post("goods", this.addGoodsForm);

    //     if (res.meta.status !== 201) {
    //       this.$message.error("添加商品失败！");
    //     }

    //     this.$message.success("添加商品成功！");
    //     // 隐藏添加用户的对话框
    //     this.addDialogVisible = false;
    //     // 重新获取用户列表数据
    //     this.getGoodsList();
    //   });
    // },
    async removeGoodById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }

      const { data: res } = await this.$http.delete("goods/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！");
      }

      this.$message.success("删除用户成功！");
      this.getGoodsList();
    },
    goaddpage() {
      this.$router.push("/goods/add");
    },
  },
};
</script>

<style>
.text {
  text-align: center;
}
</style>
