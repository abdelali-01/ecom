'use client';
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React, { useEffect } from "react";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { handleFetchCalendarItems } from "@/store/calendar/calendarHandler";
import Loader from "@/components/ui/load/Loader";
import { fetchStatistics } from "@/store/statistics/statisticsHandler";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import Image from "next/image";

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, popular_products } = useSelector((state: RootState) => state.statistics);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchStatistics());
    dispatch(handleFetchCalendarItems());
  }, [dispatch]);

  if (!user || user.role === 'manager') return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Main Metrics */}
      <EcommerceMetrics />
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 md:gap-7 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <StatisticsChart />
        </div>

        <div className="xl:col-span-5">
          <DemographicCard />
        </div>
      </div>

      {/* Monthly Sales Chart */}
      <div className="grid grid-cols-1 gap-4 md:gap-7">
        <MonthlySalesChart />
      </div>

      {/* Popular Products and Recent Orders */}
      <div className="grid grid-cols-1 gap-4 md:gap-7 xl:grid-cols-12">
        <div className="xl:col-span-4">
          {/* Popular Products Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Popular Products
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                  Top selling products this month
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {popular_products && popular_products.length > 0 ? (
                popular_products.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {product.image ? (
                            <Image
                              width={40}
                              height={40}
                              src={`${process.env.NEXT_PUBLIC_SERVER}/${product.image}`}
                              alt={product.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">No img</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                            {product.name}
                          </p>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {product.price.toLocaleString()} DA
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {product.total_sold}
                      </p>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        Sold
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No popular products data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
