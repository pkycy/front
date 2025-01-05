<template>
    <div class="home-container">
        <el-container class="home-container">

            <el-header>
                <!--头部-->
                <div class="header-content">
                    <img src="@/assets/logo.png" alt="Logo" class="logo">
                    <span>智能机器人工程数据管理系统</span>
                </div>


                <div class="header-right">

                    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false"
                        text-color="#333" active-text-color="#3c87e8">

                        <el-sub-menu index="2">
                            <template #title>admin</template>
                            <el-menu-item index="eaditInfo" @click="handleClick">修改信息</el-menu-item>

                            <el-menu-item index="/login" @click="logout">退出登录</el-menu-item>

                        </el-sub-menu>
                    </el-menu>


                    <!-- <el-button @click="logout">退出</el-button>-->
                </div>

            </el-header>
            <!--页面主体-->
            <el-container>
                <!--侧边栏-->
                <el-aside width="200px"><el-menu active-text-color="#6ca3ec" background-color="#D3DCE6"
                        class="el-menu-vertical-demo" :default-active="activeIndex" text-color="#333"
                        @select="handleSelect">


                        <!--首页-->
                        <el-sub-menu index="1">
                            <template #title>
                                <el-icon>
                                    <House />
                                </el-icon>
                                <span>首页</span>
                            </template>

                            <el-menu-item index="/homePage">
                                <el-icon>
                                    <PieChart />
                                </el-icon>
                                <span>数据统计</span>
                            </el-menu-item>

                            <!--<el-menu-item index="/homePageTwo">
                                <el-icon>
                                    <PieChart />
                                </el-icon>
                                <span>订单统计分析</span>
                            </el-menu-item>
-->
                        </el-sub-menu>
                        <!--设计管理-->
                        <el-sub-menu index="2">
                            <template #title>
                                <el-icon>
                                    <DataBoard />
                                </el-icon>
                                <span>设计管理</span>
                            </template>

                            <el-menu-item index="/designPage">
                                <el-icon>
                                    <list />
                                </el-icon>
                                <span>蓝图管理</span>
                            </el-menu-item>

                            <!-- <el-menu-item index="/designPage">
                                <el-icon>
                                    <DataBoard />
                                </el-icon>
                                <span>设计管理</span>
                            </el-menu-item>
-->
                        </el-sub-menu>

                        <!--订单管理-->
                        <el-sub-menu index="3">
                            <template #title>
                                <el-icon>
                                    <memo />
                                </el-icon>
                                <span>订单管理</span>
                            </template>

                            <el-menu-item index="/orderPage">
                                <el-icon>
                                    <list />
                                </el-icon>
                                <span>采购/制造管理</span>

                            </el-menu-item>
                            <el-menu-item index="/orderPageTwo">
                                <el-icon>
                                    <list />
                                </el-icon>
                                <span>销售管理</span>
                            </el-menu-item>

                        </el-sub-menu>
                        <!--部件管理-->
                        <el-sub-menu index="4">
                            <template #title>
                                <el-icon>
                                    <setting />
                                </el-icon>
                                <span>部件管理</span>
                            </template>


                            <el-menu-item index="/partPage">
                                <el-icon>
                                    <list />
                                </el-icon>
                                <span>部件管理</span>
                            </el-menu-item>


                        </el-sub-menu>
                        <!--产品管理-->
                        <el-sub-menu index="5">
                            <template #title>
                                <el-icon>
                                    <monitor />
                                </el-icon>
                                <span>产品管理</span>
                            </template>


                            <el-menu-item index="/productPage">
                                <el-icon>
                                    <list />
                                </el-icon>
                                <span>产品管理</span>
                            </el-menu-item>

                        </el-sub-menu>
                        <!--用户管理-->
                        <el-sub-menu index="6">
                            <template #title>
                                <el-icon>
                                    <user />
                                </el-icon>
                                <span>用户管理</span>
                            </template>


                            <el-menu-item index="/userPage">
                                <el-icon>
                                    <list />
                                </el-icon>
                                <span>用户列表</span>
                            </el-menu-item>

                            <!-- <el-menu-item index="/userPage">
                                <el-icon>
                                    <user />
                                </el-icon>
                                <span>用户管理</span>
                            </el-menu-item>
                            -->
                        </el-sub-menu>




                    </el-menu></el-aside>
                <!--页面内容-->
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>



        <!--修改个人信息-->
        <el-dialog v-model="dialogVisible" title="修改信息" width="30%">
            <el-form :model="form" :rules="rules" ref="editForm" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="电话号码" prop="phone">
                    <el-input v-model="form.phone"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm('editForm')">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">




import { ElMessage } from 'element-plus';


export default {
    name: 'HomeView',
    data() {
        return {
            activeIndex: sessionStorage.getItem('activeIndex') || '/homePage',
            dialogVisible: false,
            form: {
                username: '',
                password: '',
                phone: ''
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ],
                phone: [
                    { required: true, message: '请输入电话号码', trigger: 'blur' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的电话号码', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        logout() {
            window.sessionStorage.clear();
            this.$router.push('/login');
        },
        handleClick() {
            this.dialogVisible = true;
        },
        handleSelect(key: string) {

            if (key === 'eaditInfo') {

                this.handleClick();
            }
            this.activeIndex = key;
            window.sessionStorage.setItem('activeIndex', key);
            this.$router.push(key);

        }, submitForm(formName: string) {
            this.$refs[formName].validate((valid: boolean) => {
                if (valid) {
                    // axios.post('/user/update', this.form)
                    // 这里可以添加提交表单的逻辑，比如调用后端API
                    console.log('提交表单:', this.form);
                    ElMessage.success('修改成功');
                    this.dialogVisible = false;
                } else {
                    console.log('表单验证失败');
                    return false;
                }
            });
        }
    }
}
</script>

<style lang="less" scoped>
.home-container {
    height: 100vh;
    width: 100vw;
}

.header-content {
    display: flex;
    align-items: center;
    font-size: 20px;

}

.el-container {
    height: 100vh;
    width: 100%;
}



.logo {
    max-width: 50px;
    max-height: 50px;
    margin-right: 10px;
    margin-left: 5px;
}

.header-menu {
    flex: 1;
    display: flex;
    justify-content: flex-end;

}


.header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
}

.el-menu-demo {
    background-color: #B3C0D1;


    border: none;
}

.el-header {
    background-color: #B3C0D1;
    color: #333;
    align-items: center;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    padding-left: 0%;
}

.el-aside {
    background-color: #D3DCE6;
    color: #333;
    height: 100%;

}

.el-main {
    background-color: #E9EEF3;
    color: #333;
    height: 100%;

}
</style>