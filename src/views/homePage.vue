<template>
    <div>
        欢迎进入智能机器人工程数据管理系统
    </div>
    <div class="home-page">

        <div class="chart-container">
            <div ref="chart1" class="chart"></div>
            <div ref="chart2" class="chart"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import axios from '../utils/axios'
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer
]);

export default {
    name: 'HomePage',
    setup() {
        const chart1 = ref<HTMLElement | null>(null);
        const chart2 = ref<HTMLElement | null>(null);
        const fetchOrderCount = async (type: string) => {
            try {
                const response = await axios.get(`/order/count?type=${type}`);
                if (response.code === 1) {
                    console.log('获取订单数量成功:', response.data);
                    return response.data;
                } else {
                    console.error('获取订单数量失败:', response.msg);
                    return 0;
                }
            } catch (error) {
                console.error('获取订单数量失败:', error);
                return 0;
            }
        };

        const fetchPartCount = async (cls: string) => {
            try {

                const response = await axios.get(`/part/count?cls=${cls}`);
                if (response.code === 1) {
                    return response.data;
                } else {
                    console.error('获取部件数量失败:', response.msg);
                    return 0;
                }
            } catch (error) {
                console.error('获取部件数量失败:', error);
                return 0;
            }
        };


        onMounted(async () => {
            const orderCounts = await Promise.all([
                fetchOrderCount('Purchase'),
                fetchOrderCount('Manufacture'),
                fetchOrderCount('Sale')
            ]);

            const partCounts = await Promise.all([
                fetchPartCount('传感器零件'),
                fetchPartCount('驱动零件'),
                fetchPartCount('执行器零件'),
                fetchPartCount('其它辅助零件'),
                fetchPartCount('电器零件'),
                fetchPartCount('控制零件')
            ]);
            if (chart1.value) {
                const myChart1 = echarts.init(chart1.value);
                const option1 = {
                    title: {
                        text: '订单统计',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left'
                    },
                    series: [
                        {
                            name: '订单数量',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: orderCounts[0], name: '采购' },
                                { value: orderCounts[1], name: '制造' },
                                { value: orderCounts[2], name: '销售' }

                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                myChart1.setOption(option1);
            }

            if (chart2.value) {
                const myChart2 = echarts.init(chart2.value);
                const option2 = {
                    title: {
                        text: '部件统计',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left'
                    },
                    series: [
                        {
                            name: '部件数量',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: partCounts[0], name: '传感器零件' },
                                { value: partCounts[1], name: '驱动零件' },
                                { value: partCounts[2], name: '执行器零件' },
                                { value: partCounts[3], name: '其它辅助零件' },
                                { value: partCounts[4], name: '电器零件' },
                                { value: partCounts[5], name: '控制零件' }

                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                myChart2.setOption(option2);
            }
        });

        return {
            chart1,
            chart2
        };
    }
};
</script>

<style lang="less" scoped>
.home-page {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.chart-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 80%;
}

.chart {
    width: 45%;
    height: 100%;
}
</style>