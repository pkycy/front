<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>采购/制造/销售管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-row :gutter="10" style="margin-bottom: 20px;">
            <el-col :span="6">
                <el-input v-model="orderCodeQuery" placeholder="请输入订单编码" clearable></el-input>
            </el-col>
            <el-col :span="6">
                <el-input v-model="orderNameQuery" placeholder="请输入订单名称" clearable></el-input>
            </el-col>

            <el-col :span="3.5">
                <el-button type="plain" @click="handleSearch">查询</el-button>
                <el-button type="primary" @click="handleAdd">新增</el-button>
                <el-button type="primary" @click="handleReset">重置</el-button>
            </el-col>
            <el-col :span="3">
                <el-select v-model="orderSource" placeholder="请选择订单来源">
                    <el-option label="全部" value="all"></el-option>
                    <el-option label="采购" value="Purchase"></el-option>
                    <el-option label="制造" value="Manufacture"></el-option>
                    <el-option label="销售" value="Sale"></el-option>
                </el-select>
            </el-col>
        </el-row>

        <el-table :data="filteredTableData" stripe style="width: 100%">
            <el-table-column prop="id" label="编号" width="150" />
            <el-table-column prop="name" label="名称" width="100" />
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="type" label="来源" width="100" />
            <el-table-column prop="orderDate" label="订单日期（UTC）" width="180">
                <template #default="scope">
                    {{ new Date(scope.row.orderDate).toUTCString() }}
                </template>
            </el-table-column>
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
                <el-form-item label="名称" prop="name">
                    <el-input v-model="newForm.name" type="text"></el-input>
                </el-form-item>
                <el-form-item label="来源" prop="source">
                    <el-select v-model="newForm.source" placeholder="请选择订单来源">
                        <el-option label="采购" value="Purchase"></el-option>
                        <el-option label="制造" value="Manufacture"></el-option>
                        <el-option label="销售" value="Sale"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="数量" prop="quantity">
                    <el-input v-model.number="newForm.quantity" type="number"></el-input>
                </el-form-item>
                <el-form-item label="订单日期" prop="orderDate">
                    <el-date-picker v-model="newForm.orderDate" type="datetime" placeholder="选择日期时间"></el-date-picker>
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
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editForm.name" type="text"></el-input>
                </el-form-item>
                <el-form-item label="来源" prop="source">
                    <el-select v-model="editForm.source" placeholder="请选择订单来源">
                        <el-option label="采购" value="Purchase"></el-option>
                        <el-option label="制造" value="Manufacture"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="数量" prop="quantity">
                    <el-input v-model.number="editForm.quantity" type="number"></el-input>
                </el-form-item>
                <el-form-item label="订单日期" prop="orderDate">
                    <el-date-picker v-model="editForm.orderDate" type="datetime" placeholder="选择日期时间"></el-date-picker>
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
                <el-form-item label="名称">
                    <el-input v-model="viewForm.name" disabled></el-input>
                </el-form-item>
                <el-form-item label="来源">
                    <el-input v-model="viewForm.source" disabled></el-input>
                </el-form-item>
                <el-form-item label="数量">
                    <el-input v-model.number="viewForm.quantity" disabled></el-input>
                </el-form-item>
                <el-form-item label="订单日期">
                    <el-input v-model="viewForm.orderDate" disabled></el-input>
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

interface OrderResponse {
    data: {
        records: Order[];
        total: number;
    };
}

interface Order {
    id: string;
    name: string;
    type: string;
    quantity: string;
    orderDate: string | Date;
}

interface FetchOrdersParams {
    page?: number;
    pageSize?: number;
    name?: string;
    id?: string;
    type?: string;
}

export default defineComponent({
    name: 'OrderPage',
    setup() {
        const currentPage = ref(1)
        const pageSize = ref(10)
        const size = ref('default')
        const background = ref(false)
        const disabled = ref(false)
        const orderCodeQuery = ref('')
        const orderNameQuery = ref('')
        const orderSource = ref('all')

        const tableData = ref<Order[]>([])
        const totalOrders = ref(0)

        const addFormRef = ref<InstanceType<typeof ElForm> | null>(null);
        const editFormRef = ref<InstanceType<typeof ElForm> | null>(null);

        const filteredTableData = computed(() => {
            let filteredData = tableData.value

            if (orderCodeQuery.value) {
                filteredData = filteredData.filter(item =>
                    item.id.includes(orderCodeQuery.value)
                )
            }

            if (orderNameQuery.value) {
                filteredData = filteredData.filter(item =>
                    item.name.toLowerCase().includes(orderNameQuery.value.toLowerCase())
                )
            }

            if (orderSource.value !== 'all') {
                filteredData = filteredData.filter(item =>
                    item.type === orderSource.value
                )
            }

            return filteredData
        })

        const fetchOrders = async (params: FetchOrdersParams) => {
            try {
                const response: OrderResponse = await axios.post('/order/page', params)
                console.log('获取订单列表响应:', response); // 添加调试信息
                if (response.data && response.data.records) {
                    tableData.value = response.data.records
                    totalOrders.value = response.data.total
                    console.log('获取订单列表成功res:', response.data.records);
                    console.log('获取订单列表成功:', tableData.value);
                    ElMessage.success('获取订单列表成功')
                } else {
                    console.error('响应格式不正确:', response);
                    ElMessage.error('获取订单列表失败');
                }
            } catch (error) {
                console.error('获取订单列表失败:', error)
                ElMessage.error('获取订单列表失败')
            }
        }

        const handleSearch = () => {
            const params: FetchOrdersParams = {
                page: currentPage.value,
                pageSize: pageSize.value,
                name: orderNameQuery.value,
                id: orderCodeQuery.value,
                type: orderSource.value
            }
            fetchOrders(params);
        }

        const handleReset = () => {
            orderCodeQuery.value = ''
            orderNameQuery.value = ''
            orderSource.value = 'all'
            currentPage.value = 1; // 重置到第一页
            handleSearch()
        }

        const handleSizeChange = (val: number) => {
            pageSize.value = val;
            handleSearch();
        }

        const handleCurrentChange = (val: number) => {
            currentPage.value = val;
            handleSearch();
        }

        const addDialogVisible = ref(false)
        const newForm = ref({
            name: '' as string,
            source: '' as string,
            quantity: null as number | null,
            orderDate: '' as string | Date
        })
        const newRules = {
            name: [
                { required: true, message: '请输入订单名称', trigger: 'blur' }
            ],
            source: [
                { required: true, message: '请选择订单来源', trigger: 'change' }
            ],
            quantity: [
                { required: true, message: '请输入数量', trigger: 'change' }
            ],
            orderDate: [
                { required: true, message: '请选择订单日期', trigger: 'change' }
            ]
        }

        const handleAdd = () => {
            newForm.value = {
                name: '',
                source: '',
                quantity: null as number | null,
                orderDate: ''
            }
            addDialogVisible.value = true
        }

        const submitAddForm = () => {
            if (!addFormRef.value) return;

            addFormRef.value.validate(async (valid: boolean) => {
                if (valid) {
                    try {
                        const orderDate = new Date(newForm.value.orderDate).getTime();
                        await axios.post('/order/insert', {
                            name: newForm.value.name,
                            quantity: newForm.value.quantity,
                            orderDate: orderDate,
                            type: newForm.value.source
                        })
                        ElMessage.success('新增成功')
                        addDialogVisible.value = false
                        handleSearch()
                    } catch (error) {
                        console.error('新增订单失败:', error)
                        ElMessage.error('新增失败')
                    }
                } else {
                    console.log('表单验证失败')
                    return;
                }
            })
        }

        const editDialogVisible = ref(false)
        const editForm = ref({
            id: '' as string,
            name: '' as string,
            type: '' as string,
            quantity: '' as string,
            orderDate: '' as string | Date
        })
        const editRules = {
            name: [
                { required: true, message: '请输入订单名称', trigger: 'blur' }
            ],
            source: [
                { required: true, message: '请选择订单来源', trigger: 'change' }
            ],
            quantity: [
                { required: true, message: '请输入数量', trigger: 'change' }
            ],
            orderDate: [
                { required: true, message: '请选择订单日期', trigger: 'change' }
            ]
        }

        const handleEdit = (row: Order) => {
            editForm.value = { ...row }
            editDialogVisible.value = true
        }

        const submitEditForm = () => {
            if (!editFormRef.value) return;

            editFormRef.value.validate(async (valid: boolean) => {
                if (valid) {
                    try {
                        const orderDate = new Date(editForm.value.orderDate).getTime();
                        await axios.post('/order/update', {
                            id: editForm.value.id,
                            name: editForm.value.name,
                            quantity: editForm.value.quantity,
                            orderDate: orderDate,
                            type: editForm.value.type
                        })
                        ElMessage.success('修改成功')
                        editDialogVisible.value = false
                        handleSearch()
                    } catch (error) {
                        console.error('修改订单失败:', error)
                        ElMessage.error('修改失败')
                    }
                } else {
                    console.log('表单验证失败')
                    return;
                }
            })
        }

        const handleDelete = (row: Order) => {
            ElMessageBox.confirm('确定删除该订单?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    const response = await axios.post(`/order/delete?id=${row.id}`);
                    if (response.code === 1) {
                        ElMessage.success('删除成功');
                        const index = tableData.value.findIndex(item => item.id === row.id);
                        if (index !== -1) {
                            tableData.value.splice(index, 1);
                        }
                        totalOrders.value -= 1;
                        if (filteredTableData.value.length === 0 && currentPage.value > 1) {
                            currentPage.value -= 1;
                        }
                        handleSearch();
                    } else {
                        ElMessage.error('删除失败: ' + (response.msg || '未知错误'));
                    }
                } catch (error) {
                    console.error('删除订单失败:', error);
                    ElMessage.error('删除失败');
                }
            }).catch(() => {
                ElMessage.info('已取消删除');
            });
        };

        const viewDialogVisible = ref(false)
        const viewForm = ref({
            id: '' as string,
            name: '' as string,
            source: '' as string,
            quantity: '' as string,
            orderDate: '' as string | Date,
        })

        const handleView = async (row: Order) => {
            try {
                const order = tableData.value.find(item => item.id === row.id);
                if (order) {
                    viewForm.value = {
                        id: order.id,
                        name: order.name,
                        source: order.type,
                        quantity: order.quantity,
                        orderDate: new Date(order.orderDate).toUTCString() // 将时间戳转换为UTC字符串
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

        onMounted(() => {
            handleSearch();
        })

        return {
            currentPage,
            pageSize,
            size,
            background,
            disabled,
            orderCodeQuery,
            orderNameQuery,
            orderSource,
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
            addFormRef,
            editFormRef
        }
    }
})
</script>