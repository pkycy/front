<template>
    <div><el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>
                <a href="/">用户管理</a>
            </el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb></div>


    <el-row :gutter="10">
        <el-col :span="6"> <el-input v-model="searchQuery" style="max-width: 600px" placeholder="请输入用户名"
                class="input-with-select" clearable>

            </el-input>
        </el-col>
        <el-col :span="7">
            <el-button type="plain" plain @click="handleSearch">查询</el-button>


            <el-button type="primary" plain @click="handleAdd">新增</el-button>

            <el-button type="primary" plain @click="handleReset">重置</el-button>
        </el-col>
    </el-row>

    <el-table :data="filteredTableData" stripe style="width: 100%">

        <!--  <el-table-column prop="date" label="注册日期" width="180" /> -->
        <el-table-column prop="name" label="用户名" width="180" />
        <el-table-column prop="phone" label="电话号码" width="180" />
        <el-table-column prop="authority" label="权限" width="200" />
        <el-table-column label="操作">
            <template #default="scope">
                <el-button type="primary" plain :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>

            </template>

        </el-table-column>


    </el-table>

    <el-pagination v-model:current-page="currentPage4" v-model:page-size="pageSize4" :page-sizes="[5, 10, 20, 50]"
        :size="size" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
        :total="4" @size-change="handleSizeChange" @current-change="handleCurrentChange" />

    <!-- 新增用户对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增用户" width="60%">
        <el-form :model="newForm" :rules="newRules" ref="addFormRef" label-width="100px">
            <el-form-item label="姓名" prop="name">
                <el-input v-model="newForm.name"></el-input>
            </el-form-item>
            <el-form-item label="权限" prop="authority">
                <el-select v-model="newForm.authority" placeholder="请选择权限">
                    <el-option label="普通用户" value="Normal"></el-option>
                    <el-option label="管理员" value="Admin"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="密码" prop="user_Password">
                <el-input v-model="newForm.user_Password" type="password"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="phone">
                <el-input v-model="newForm.phone"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitAddForm">确定</el-button>
            </span>
        </template>
    </el-dialog>

    <!-- 查看用户信息对话框 -->
    <el-dialog v-model="viewDialogVisible" title="查看用户信息" width="60%">
        <el-form :model="viewForm" label-width="100px">
            <el-form-item label="ID">
                <el-input v-model="viewForm.id" disabled></el-input>
            </el-form-item>
            <el-form-item label="姓名">
                <el-input v-model="viewForm.name" disabled></el-input>
            </el-form-item>
            <el-form-item label="权限">
                <el-input v-model="viewForm.authority" disabled></el-input>
            </el-form-item>
            <el-form-item label="电话">
                <el-input v-model="viewForm.phone" disabled></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="viewDialogVisible = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑用户" width="60%">
        <el-form :model="form" :rules="rules" ref="editForm" label-width="100px">
            <el-form-item label="ID" prop="id">
                <el-input v-model="form.id" disabled></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="权限" prop="authority">
                <el-select v-model="form.authority" placeholder="请选择权限">
                    <el-option label="普通用户" value="Normal"></el-option>
                    <el-option label="管理员" value="Admin"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="电话" prop="phone">
                <el-input v-model="form.phone"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">确定</el-button>
            </span>
        </template>
    </el-dialog>



</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete } from '@element-plus/icons-vue';
import type { ComponentSize, FormInstance } from 'element-plus';
import axios from '../utils/axios'

interface User {
    id: string;
    name: string;
    phone: string;
    authority: string;
}

interface ApiResponse {
    code: string;
    msg: string | null;
    data: null;
}

interface UserResponse {
    id: number;
    authority: string;
    name: string;
    user_Password: string;
    phone: string | null;
}



export default defineComponent({
    setup() {
        const currentPage4 = ref(1);
        const pageSize4 = ref(10);
        const size = ref<ComponentSize>('default');
        const background = ref(false);
        const disabled = ref(false);
        const searchQuery = ref('');
        const tableData = ref<User[]>([]);
        const total = ref(0);
        const addFormRef = ref<FormInstance | null>(null);
        const filteredTableData = computed(() => {
            if (!searchQuery.value) return tableData.value;
            return tableData.value.filter(item =>
                item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        });

        const handleSearch = () => {
            fetchData();
        };

        const handleReset = () => {
            searchQuery.value = '';
            fetchData();
        };

        const handleSizeChange = (val: number) => {
            pageSize4.value = val;
            fetchData();
        };

        const handleCurrentChange = (val: number) => {
            currentPage4.value = val;
            fetchData();
        };

        const fetchData = async () => {
            try {
                const params: { id?: string; name?: string; page: number; pageSize: number } = {
                    page: currentPage4.value,
                    pageSize: pageSize4.value,
                    name: ''
                };



                const response = await axios.post<ApiResponse>('/user/page', params);
                if (response.code === 1) {
                    console.log(response);
                    tableData.value = response.data.records;

                    total.value = response.data.total;

                } else {
                    ElMessage.error('获取用户信息失败: ' + response.data.msg);
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
                ElMessage.error('获取用户信息失败');
            }

        };

        const dialogVisible = ref(false);
        const form = ref({
            id: '',
            name: '',
            phone: '',
            authority: ''
        });
        const rules = {
            name: [
                { required: true, message: '请输入用户名', trigger: 'blur' }
            ],
            phone: [
                { required: true, message: '请输入电话号码', trigger: 'blur' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的电话号码', trigger: 'blur' }
            ],
            authority: [
                { required: true, message: '请选择权限', trigger: 'change' }
            ]
        };

        const handleEdit = (row: User) => {
            form.value = { ...row };
            dialogVisible.value = true;
        };

        const editForm = ref<FormInstance | null>(null);

        const submitForm = () => {
            const formEl = editForm.value;
            if (!formEl) return;

            formEl.validate(async (valid: boolean) => {
                console.log('form', form.value);

                if (valid) {
                    try {
                        const response = await axios.post<ApiResponse>('/user/update', form.value); // 修改这里
                        if (response.code === 1) {
                            ElMessage.success('修改成功');
                            // 更新 tableData 中的数据
                            const index = tableData.value.findIndex(item => item.id === form.value.id);
                            if (index !== -1) {
                                tableData.value[index] = { ...form.value };
                            }
                            dialogVisible.value = false;
                        } else {
                            ElMessage.error('修改失败: ' + response.data.msg);
                        }
                    } catch (error) {
                        console.error('修改用户信息失败:', error);
                        ElMessage.error('修改用户信息失败');
                    }
                } else {
                    console.log('表单验证失败');
                    return;
                }
            });
        };

        const addDialogVisible = ref(false);
        const newForm = ref({

            name: '' as string,
            phone: '' as string,
            authority: '' as string,
            user_Password: '' as string
        });
        const newRules = {
            name: [
                { required: true, message: '请输入用户名', trigger: 'blur' }
            ],
            phone: [
                { required: false, message: '请输入电话号码', trigger: 'blur' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的电话号码', trigger: 'blur' }
            ],
            authority: [
                { required: true, message: '请选择权限', trigger: 'change' }
            ],
            user_Password: [
                { required: true, message: '请输入密码', trigger: 'blur' },
                { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
            ]
        };

        const handleAdd = () => {
            newForm.value = {

                name: '' as string,

                authority: '' as string,
                user_Password: '' as string,
                phone: '' as string,
            };
            addDialogVisible.value = true;
        };

        const submitAddForm = () => {

            if (!addFormRef.value) return;

            addFormRef.value.validate(async (valid: boolean) => {
                console.log('form', newForm.value);

                if (valid) {
                    try {
                        await axios.post('/user/insert', {
                            name: newForm.value.name,

                            authority: newForm.value.authority,
                            user_Password: newForm.value.user_Password,
                            phone: newForm.value.phone,
                        })
                        console.log('newForm.value', newForm.value);

                        addDialogVisible.value = false;

                        ElMessage.success('新增成功');
                        addDialogVisible.value = false;
                        fetchData();

                    } catch (error) {
                        console.error('新增用户失败:', error);
                        ElMessage.error('新增用户失败');
                    }
                } else {
                    console.log('表单验证失败');
                    return;
                }
            });
        };

        const viewDialogVisible = ref(false);
        const viewForm = ref<User>({
            id: '',
            name: '',
            phone: '',
            authority: ''
        });

        const handleView = async (row: User) => {
            try {
                const response = await axios.get<ApiResponse<UserResponse>>('/user/getById', { params: { id: row.id } });
                if (response.code === 1) {
                    viewForm.value = {
                        id: response.data.id,
                        name: response.data.name,
                        phone: response.data.phone || '', // 处理可能的 null 值
                        authority: response.data.authority
                    };
                    viewDialogVisible.value = true;
                } else {
                    ElMessage.error('获取用户信息失败: ' + response.msg);
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
                ElMessage.error('获取用户信息失败');
            }
        };

        const handleDelete = (row: User) => {
            ElMessageBox.confirm('确定删除该用户?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const response = await axios.post<ApiResponse<UserResponse>>(`/user/delete?id=${row.id}`);
                    if (response.data.code === 1) {
                        ElMessage.success('删除成功');
                        fetchData();
                    } else {
                        ElMessage.error('删除失败: ' + response.data.msg);
                    }
                } catch (error) {
                    console.error('删除用户失败:', error);
                    ElMessage.error('删除用户失败');
                }
            }).catch(() => {
                ElMessage.info('已取消删除');
            });
        };

        onMounted(() => {
            fetchData();
        });

        return {
            currentPage4,
            pageSize4,
            size,
            background,
            disabled,
            searchQuery,
            filteredTableData,
            handleSearch,
            handleReset,
            handleSizeChange,
            handleCurrentChange,
            fetchData,
            dialogVisible,
            form,
            rules,
            handleEdit,
            submitForm,
            editForm,
            addDialogVisible,
            newForm,
            newRules,
            handleAdd,
            submitAddForm,
            viewDialogVisible,
            viewForm,
            handleView,
            handleDelete,
            Edit,
            Delete,
            total,
            addFormRef
        };
    }
});
</script>

<style lang="less" scoped>
.input-with-select .el-input-group__prepend {
    background-color: var(--el-fill-color-blank);
}
</style>