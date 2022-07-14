<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <div style="margin-top: 15px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              placeholder="请输入内容"
              v-model="queryInfo.query"
              clearable
              @clear="getlist"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getlist"
              ></el-button> </el-input
          ></el-col>
          <el-col>
            <el-button type="primary" @click="dialogVisible = true"
              >添加用户</el-button
            >
          </el-col>
        </el-row>
        <template>
          <el-table :data="userlist" stripe border style="width: 100%">
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="username" label="姓名"> </el-table-column>
            <el-table-column prop="email" label="邮箱"> </el-table-column>
            <el-table-column prop="mobile" label="电话"> </el-table-column>
            <el-table-column prop="role_name" label="角色"> </el-table-column>
            <el-table-column prop="mg_state" label="状态">
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.mg_state"
                  @change="userStateChanged(scope.row)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-row>
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    circle
                    @click="showEditDialog(scope.row.id)"
                  ></el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    @click="removeUserById(scope.row.id)"
                  ></el-button>
                  <el-tooltip
                    effect="dark"
                    content="分配角色"
                    placement="top"
                    :enterable="false"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-setting"
                      circle
                      @click="setRole(scope.row)"
                    ></el-button>
                  </el-tooltip>
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
          <el-dialog
            title="添加用户"
            :visible.sync="dialogVisible"
            width="50%"
            @close="addDialogClosed"
          >
            <el-form
              :model="addForm"
              :rules="addFormRules"
              ref="addFormRef"
              label-width="70px"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="addForm.password"></el-input> </el-form-item
              ><el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input> </el-form-item
              ><el-form-item label="手机" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
          </el-dialog>
          <!-- 修改用户的对话框 -->
          <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed"
          >
            <el-form
              :model="editForm"
              :rules="editFormRules"
              ref="editFormRef"
              label-width="70px"
            >
              <el-form-item label="用户名">
                <el-input v-model="editForm.username" disabled></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
              </el-form-item>
              <el-form-item label="手机" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="editDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
          </el-dialog>

          <!-- 分配角色的对话框 -->
          <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%"
            @close="setRoleDialogClosed"
          >
            <div>
              <p>当前的用户：{{ userInfo.username }}</p>
              <p>当前的角色：{{ userInfo.role_name }}</p>
              <p>
                分配新角色：
                <el-select v-model="selectedRoleId" placeholder="请选择">
                  <el-option
                    v-for="item in rolesList"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id"
                  >
                  </el-option>
                </el-select>
              </p>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button @click="setRoleDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
          </el-dialog>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }

      cb(new Error("请输入合法的邮箱"));
    };

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (regMobile.test(value)) {
        return cb();
      }

      cb(new Error("请输入合法的手机号"));
    };

    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      tableData: [
        {
          index: "",
          username: "",
          email: "",
          mobile: "",
          role_name: "",
          mg_state: 0,
        },
      ],
      userlist: [],
      total: 0,
      dialogVisible: false,
      addForm: {
        username: "",
        password: "",
      },
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在 3 到 10 个字符之间",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码的长度在 6 到 15 个字符之间",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: "请输入用户邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入用户手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: "",
    };
  },
  created() {
    this.getlist();
  },
  methods: {
    async getlist() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error("获取用户数据列表失败");
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getlist();
    },
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getlist();
    },
    async userStateChanged(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新用户状态失败！");
      }
      return this.$message.success("更新状态成功！");
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);

        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败！");
        }

        this.$message.success("添加用户成功！");
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据
        this.getlist();
      });
    },
    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get("users/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败！");
      }

      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败！");
        }

        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新数据列表
        this.getlist();
        // 提示修改成功
        this.$message.success("更新用户信息成功！");
      });
    },
    // 根据Id删除对应的用户信息
    async removeUserById(id) {
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

      const { data: res } = await this.$http.delete("users/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！");
      }

      this.$message.success("删除用户成功！");
      this.getlist();
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;

      // 在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }

      this.rolesList = res.data;

      this.setRoleDialogVisible = true;
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色！");
      }

      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId,
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("更新角色失败！");
      }

      this.$message.success("更新角色成功！");
      this.getlist();
      this.setRoleDialogVisible = false;
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = "";
      this.userInfo = {};
    },
  },
};
</script>

<style lang="less" scoped></style>
