<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>产品管理管理</el-breadcrumb-item>

            <el-breadcrumb-item>产品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-row :gutter="10" style="margin-bottom: 20px;">
            <el-col :span="6">
                <el-input v-model="orderCodeQuery" placeholder="请输入产品编码" clearable></el-input>
            </el-col>
            <el-col :span="6">
                <el-input v-model="orderNameQuery" placeholder="请输入产品名称" clearable></el-input>
            </el-col>

            <el-col :span="6">
                <el-button type="plain" @click="handleSearch">查询</el-button>
                <el-button type="primary" @click="handleAdd">新增</el-button>
                <el-button type="primary" @click="handleReset">重置</el-button>
            </el-col>
        </el-row>

        <el-table :data="filteredTableData" stripe style="width: 100%">
            <el-table-column prop="id" label="编号" width="180" />
            <el-table-column prop="productName" label="名称" width="180" />
            <el-table-column prop="productInformation" label="基本信息" width="180" />
            <el-table-column prop="productOwner" label="负责人" width="100" />
            <el-table-column prop="productStage" label="产品阶段" width="150" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
                    <el-button type="info" plain @click="handleView(scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
            :size="size" :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper"
            :total="totalOrders" @size-change="handleSizeChange" @current-change="handleCurrentChange" />

        <!-- 新增订单对话框 -->
        <el-dialog v-model="addDialogVisible" title="新增订单" width="60%">
            <el-form :model="newForm" :rules="newRules" ref="addFormRef" label-width="100px">
                <el-form-item label="产品名称" prop="productName">
                    <el-input v-model="newForm.productName" type="text"></el-input>
                </el-form-item>
                <el-form-item label="负责人" prop="productOwner">
                    <el-input v-model="newForm.productOwner" type="text"></el-input>
                </el-form-item>
                <el-form-item label="基本信息" prop="productInformation">
                    <el-input v-model="newForm.productInformation" type="text" :rows="8"></el-input>
                </el-form-item>
                <el-form-item label="产品阶段" prop="productStage">
                    <el-select v-model="newForm.productStage" placeholder="请选择产品阶段">
                        <el-option label="初始阶段" value="InitialStage"></el-option>
                        <el-option label="设计阶段" value="DesignStage"></el-option>
                        <el-option label="开发阶段" value="DevelopmentStage"></el-option>
                        <el-option label="部件阶段" value="PartStage"></el-option>
                        <el-option label="销售阶段" value="SaleStage"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitAddForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 编辑订单对话框 -->
        <el-dialog v-model="editDialogVisible" title="编辑订单" width="60%">
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
                <el-form-item label="产品名称" prop="productName">
                    <el-input v-model="editForm.productName" type="text"></el-input>
                </el-form-item>
                <el-form-item label="负责人" prop="productOwner">
                    <el-input v-model="editForm.productOwner" type="text"></el-input>
                </el-form-item>
                <el-form-item label="基本信息" prop="productInformation">
                    <el-input v-model="editForm.productInformation" type="text" :rows="8"></el-input>
                </el-form-item>
                <el-form-item label="产品阶段" prop="productStage">
                    <el-select v-model="editForm.productStage" placeholder="请选择产品阶段" :disabled="!isAdmin">
                        <el-option label="初始阶段" value="InitialStage"></el-option>
                        <el-option label="设计阶段" value="DesignStage"></el-option>
                        <el-option label="开发阶段" value="DevelopmentStage"></el-option>
                        <el-option label="部件阶段" value="PartStage"></el-option>
                        <el-option label="销售阶段" value="SaleStage"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitEditForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 查看订单对话框 -->
        <el-dialog v-model="viewDialogVisible" title="查看订单" width="60%">
            <el-form :model="viewForm" label-width="100px">
                <el-form-item label="编号">
                    <el-input v-model="viewForm.id" disabled></el-input>
                </el-form-item>
                <el-form-item label="产品名称">
                    <el-input v-model="viewForm.productName" disabled></el-input>
                </el-form-item>
                <el-form-item label="负责人">
                    <el-input v-model="viewForm.productOwner" disabled></el-input>
                </el-form-item>
                <el-form-item label="基本信息">
                    <el-input v-model="viewForm.productInformation" disabled :rows="8"></el-input>
                </el-form-item>
                <el-form-item label="产品阶段">
                    <el-input v-model="viewForm.productStage" disabled></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="viewDialogVisible = false">关闭</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import axios from '../utils/axios'
interface FetchProductsParams {
    page: number;
    pageSize: number;
    name?: string;
    id?: string;
}
interface ApiResponse<T> {
    code: number;
    msg: string | null;
    data: T | null;
}

interface Product {
    id: string;
    productOwner: string;
    productInformation: string;
    productName: string;
    productStage: 'InitialStage' | 'DesignStage' | 'DevelopmentStage' | 'PartStage' | 'SaleStage';
}

interface ProductPageResponse {
    total: number;
    records: Product[];
}

export default defineComponent({
    name: 'ProductPage',
    setup() {
        const currentPage = ref(1)
        const pageSize = ref(10)
        const size = ref('default')
        const background = ref(false)
        const disabled = ref(false)
        const orderCodeQuery = ref('')
        const orderNameQuery = ref('')
        const addFormRef = ref<InstanceType<typeof ElForm> | null>(null);

        const editFormRef = ref<InstanceType<typeof ElForm> | null>(null);

        const editForm = ref<Product>({
            id: '' as string,
            productOwner: '',
            productInformation: '',
            productName: '',
            productStage: 'InitialStage'
        });

        const tableData = ref<Product[]>([])
        const totalOrders = ref(0)
        const filteredTableData = computed(() => {
            let filteredData = tableData.value;

            if (orderCodeQuery.value) {
                filteredData = filteredData.filter(item =>
                    item.id.toString().includes(orderCodeQuery.value)
                );
            }

            if (orderNameQuery.value) {
                filteredData = filteredData.filter(item =>
                    item.productName.toLowerCase().includes(orderNameQuery.value.toLowerCase())
                );
            }

            return filteredData;
        });
        const fetchData = async () => {
            try {
                const params: FetchProductsParams = {
                    page: currentPage.value,
                    pageSize: pageSize.value,
                    name: orderNameQuery.value,
                    id: orderCodeQuery.value
                };

                const response = await axios.post<ApiResponse<ProductPageResponse>>('/product/page', params);
                console.log('获取产品列表响应:', currentPage.value, pageSize.value); // 添加日志

                if (response.code === 1) {
                    tableData.value = response.data.records;
                    totalOrders.value = response.data.total;
                } else {
                    ElMessage.error('获取产品信息失败: ' + (response.data.msg || '未知错误'));
                }
            } catch (error) {
                console.error('获取产品信息失败:', error);
                ElMessage.error('获取产品信息失败');
            }
        };
        const handleSearch = () => {
            fetchData();
        }

        const handleReset = () => {
            orderCodeQuery.value = ''
            orderNameQuery.value = ''
            currentPage.value = 1
            fetchData();
        }

        const handleSizeChange = (val: number) => {
            pageSize.value = val;
            fetchData();
        }

        const handleCurrentChange = (val: number) => {
            currentPage.value = val;
            fetchData();
        }

        const addDialogVisible = ref(false)
        const newForm = ref({

            productOwner: '' as string,
            productInformation: '' as string,
            productName: '' as string,
            productStage: 'InitialStage'
        })
        const newRules = {
            productOwner: [
                { required: true, message: '请输入产品负责人', trigger: 'blur' }
            ],
            productInformation: [
                { required: true, message: '请输入产品信息', trigger: 'blur' }
            ],
            productName: [
                { required: true, message: '请输入产品名称', trigger: 'blur' }
            ]
        }

        const handleAdd = () => {

            newForm.value = {

                productOwner: '',
                productInformation: '',
                productName: '',
                productStage: 'InitialStage'
            };
            addDialogVisible.value = true;
        }

        const submitAddForm = () => {
            if (!addFormRef.value) return;
            addFormRef.value.validate(async (valid: boolean) => {
                console.log('提交表单:', valid);
                if (valid) {
                    try {
                        console.log('提交表单:', newForm.value);
                        await axios.post('/product/insert',
                            {

                                productOwner: newForm.value.productOwner,
                                productInformation: newForm.value.productInformation,
                                productName: newForm.value.productName,
                                productStage: newForm.value.productStage
                            }
                        );

                        ElMessage.success('新增成功');
                        //  tableData.value.push(response.data);
                        addDialogVisible.value = false;

                        ElMessage.success('新增成功');
                        //  tableData.value.push(response.data);
                        addDialogVisible.value = false;
                        handleSearch();
                    }


                    catch (error) {
                        console.error('新增产品失败:', error);
                        ElMessage.error('新增产品失败');
                    }
                } else {
                    console.log('表单验证失败');
                    return;
                }
            });
        };

        const editDialogVisible = ref(false)

        const editRules = {
            productOwner: [
                { required: true, message: '请输入产品负责人', trigger: 'blur' }
            ],
            productInformation: [
                { required: true, message: '请输入产品信息', trigger: 'blur' }
            ],
            productName: [
                { required: true, message: '请输入产品名称', trigger: 'blur' }
            ],
            productStage: [
                { required: true, message: '请选择产品阶段', trigger: 'change' }
            ]
        }

        const handleEdit = (row: Product) => {
            editForm.value.id = row.id
            editForm.value.productOwner = row.productOwner
            editForm.value.productInformation = row.productInformation
            editForm.value.productName = row.productName
            editForm.value.productStage = row.productStage

            editDialogVisible.value = true;
        }

        const submitEditForm = () => {
            if (!editFormRef.value) return;
            editFormRef.value.validate(async (valid: boolean) => {
                if (valid) {
                    try {
                        const response = await axios.post<ApiResponse<Product>>('/product/update', editForm.value);
                        if (response.code === 1) {
                            ElMessage.success('修改成功');
                            handleSearch();
                            editDialogVisible.value = false;

                        } else {
                            ElMessage.error('修改失败: ' + (response.data.msg || '未知错误'));
                        }
                    } catch (error) {
                        console.error('修改产品失败:', error);
                        ElMessage.error('修改产品失败');
                    }
                } else {
                    console.log('表单验证失败');
                    return;
                }
            });
        };
        const handleDelete = (row: Product) => {
            ElMessageBox.confirm('确定删除该产品?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const response = await axios.post<ApiResponse<void>>(`/product/delete?id=${row.id}`);
                    if (response.code === 1) {
                        ElMessage.success('删除成功');

                        // 从 tableData 中移除对应的订单数据
                        const index = tableData.value.findIndex(item => item.id === row.id);
                        if (index !== -1) {
                            tableData.value.splice(index, 1);
                        }

                        // 更新 totalOrders
                        totalOrders.value -= 1;

                        // 如果当前页没有数据且不是第一页，则跳转到上一页
                        if (filteredTableData.value.length === 0 && currentPage.value > 1) {
                            currentPage.value -= 1;
                        }

                        // 重新加载数据
                        handleSearch();
                    } else {
                        ElMessage.error('删除失败: ' + (response.msg || '未知错误'));
                    }
                } catch (error) {
                    console.error('删除产品失败:', error);
                    ElMessage.error('删除失败');
                }
            }).catch(() => {
                ElMessage.info('已取消删除');
            });
        };
        const viewDialogVisible = ref(false)
        const viewForm = ref({
            id: '' as string,
            productOwner: '',
            productInformation: '',
            productName: '',
            productStage: 'InitialStage'
        })
        const handleView = async (row: Product) => {
            try {
                const product = tableData.value.find(item => item.id === row.id);
                if (product) {
                    viewForm.value = {
                        id: product.id,
                        productOwner: product.productOwner,
                        productInformation: product.productInformation,
                        productName: product.productName,
                        productStage: product.productStage
                    };
                    viewDialogVisible.value = true;
                } else {
                    ElMessage.error('未找到订单详情');
                }
            } catch (error) {
                console.error('获取订单详情失败:', error);
                ElMessage.error('获取订单详情失败');
            }
        };

        const isAdmin = ref(false);
        onMounted(() => {
            isAdmin.value = sessionStorage.getItem('isAdmin') === 'true';
            fetchData();
        });

        return {
            currentPage,
            pageSize,
            size,
            background,
            disabled,
            orderCodeQuery,
            orderNameQuery,
            tableData,
            totalOrders,
            filteredTableData,
            handleSearch,
            handleReset,
            handleSizeChange,
            handleCurrentChange,
            addDialogVisible,
            newForm,
            newRules,
            handleAdd,
            submitAddForm,
            editDialogVisible,
            editForm,
            editRules,
            handleEdit,
            submitEditForm,
            handleDelete,
            viewDialogVisible,
            viewForm,
            handleView,
            isAdmin,
            addFormRef,
            editFormRef
        }
    }
})
</script>