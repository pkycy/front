<template>

    <div class="login_container">

        <div class="login_box">


            <!--登录表单-->
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="50px"
                class="login_form">
                <h2 class="login-title">登录</h2>

                <el-form-item prop="username">

                    <el-input v-model="loginForm.username" style="width: 300px" prefix-icon="User">
                    </el-input>
                </el-form-item>

                <el-form-item prop="password">

                    <el-input v-model="loginForm.password" style="width: 300px" prefix-icon="Lock"
                        type="password"></el-input>
                </el-form-item>


                <el-form-item class="btns">
                    <div class="btn-group">
                        <el-button type="primary" @click="login">登录</el-button>
                        <el-button @click="resetLoginForm">取消</el-button>
                    </div>

                    <!--<el-form-item class="register-link">
                        <div>
                            <el-link>还没有账号？去注册</el-link>
                        </div>
                    </el-form-item>
-->
                </el-form-item>


            </el-form>
        </div>
    </div>
</template>


<script lang="ts">
import axios from '../utils/axios'
import { defineComponent, ref } from 'vue';
import { ElForm, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
interface LoginResponse {
    code: number;
    msg: string;
    data: {
        id: number;
        token: string;
        authority: string;
    };
}
export default defineComponent({
    name: 'LoginView',
    setup() {
        const loginFormRef = ref<InstanceType<typeof ElForm> | null>(null);
        const router = useRouter();
        return {
            loginFormRef,
            router,
        };
    },
    data() {
        return {
            loginForm: {
                username: 'haha',
                password: '123456'
            },
            loginFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                ]
            }
        }
    },
    methods: {
        resetLoginForm() {
            if (this.loginFormRef) {
                this.loginFormRef.resetFields();
            }
        },
        async login() {
            if (this.loginFormRef) {
                this.loginFormRef.validate(async (valid: boolean) => {
                    if (!valid) return;

                    try {
                        // 发送实际的登录请求
                        const response = await axios.post<LoginResponse>('/user/login', this.loginForm);
                        if (response.code !== 1) {

                            ElMessage.error('登录失败: ' + response.msg);
                            return;
                        }
                        ElMessage.success('登录成功');
                        window.sessionStorage.setItem('token', response.data.token);
                        window.sessionStorage.setItem('isAdmin', String(response.data.authority === 'Admin'));
                        console.log('Token 存储成功:', response.data.token); // 添加调试日志
                        this.router.push('/home');
                    } catch (error) {
                        console.error('登录请求失败:', error);
                        ElMessage.error('登录请求失败');
                    }
                });
            }
        }
    }
});
</script>
<!-- 
<script lang="ts">


export default {
    name: 'LoginView',
    data() {
        return {
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            loginFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                ]
            }
        }
    },
    methods: {
        resetLoginForm() {
            (this.$refs.loginFormRef).resetFields();
        },
        async login() {
            (this.$refs.loginFormRef).validate(async (valid: boolean) => {
                if (!valid) return;

                try {
                    // 发送实际的登录请求
                    const response = await this.$http.post('/login', this.loginForm);
                    if (response.data.code !== 1) {
                        return this.$message.error('登录失败: ' + response.data.msg);
                    }
                    this.$message.success('登录成功');
                    window.sessionStorage.setItem('token', response.data.data.token);
                    window.sessionStorage.setItem('isAdmin', response.data.data.authority === 'Admin');
                    this.$router.push('/home');
                } catch (error) {
                    console.error('登录请求失败:', error);
                    this.$message.error('登录请求失败');
                }
            });
        }
    }
    //无后端模拟
    /**     resetLoginForm() {
            (this.$refs.loginFormRef).resetFields();
        },
        async login() {
            (this.$refs.loginFormRef).validate(async (valid: boolean) => {
                if (!valid) return;

                // 模拟后端响应
                const mockResponse = await this.mockLoginRequest(this.loginForm);
                if (mockResponse.status !== 200) {
                    return this.$message.error('登录失败');
                }
                this.$message.success('登录成功');
                window.sessionStorage.setItem('token', mockResponse.data.token);
                this.$router.push('/home');
            });
        },
        mockLoginRequest(loginForm: { username: string; password: string }) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // 模拟成功的登录请求
                    if (loginForm.username === 'admin' && loginForm.password === '123456') {
                        resolve({ status: 200, data: { meta: { status: 200 }, token: 'mockToken' } });
                    } else {
                        resolve({ status: 400, data: { meta: { status: 400 } } });
                    }
                }, 1000); // 模拟网络延迟
            });
        }
    }*/

}

</script> -->

<style lang="less" scoped>
.login_container {
    background-image: url('@/assets/background.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #B3C0D1;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
}


.login-title {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
}

.login_box {
    width: 450px;
    height: 300px;
    background-color: #ffffff;
    border-radius: 3px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
}


.btns {
    display: flex;
    justify-content: flex-end;
    /* 将按钮组右对齐 */
    align-items: center;
}

.btn-group {
    display: flex;
    gap: 10px;
}

.register-link {
    text-align: right;
    margin-top: 10px;
    margin-left: 60px;
}

.login_form {
    height: 70%;
    width: 90%;

}
</style>
