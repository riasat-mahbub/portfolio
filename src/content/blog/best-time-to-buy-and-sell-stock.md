---
title: "Best Time to Buy and Sell Stock - Array Problem"
description: "Finding maximum profit from a single buy-sell transaction using optimized approaches"
tags: ["Array", "Dynamic Programming", "Two Pointers"]
publishDate: 2026-02-04
---

## Problem Statement

You are given an array `prices` where `prices[i]` is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

## Examples

**Example 1:**

- Input: `prices = [7,1,5,3,6,4]`
- Output: `5`
- Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.

**Example 2:**

- Input: `prices = [7,6,4,3,1]`
- Output: `0`
- Explanation: In this case, no transactions are done and the max profit = 0.

## Approach

This is a classic array problem that can be solved efficiently using a single pass approach. The key insight is to track the minimum price seen so far (best buying opportunity) and calculate the profit for each day if we were to sell on that day.

## Solutions

### First Approach

This is the standard greedy solution. It moves through the array linearly, maintaining a "running minimum" and checking the profit at every single step.

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        if(prices.empty()) return 0; // Guard clause

        int minPrice = prices[0];
        int maxProfit = 0;

        for(int i = 1; i < prices.size(); i++){
            if(prices[i] < minPrice)
                minPrice = prices[i]; // Update the best day to buy
            else
                maxProfit = max(maxProfit, prices[i] - minPrice); // Update max profit
        }
        return maxProfit;
    }
};

```

1. Initialize: Start by assuming the first day is the best day to buy.

2. Scan Once: For every new price, check if it's the new minimum.

3. Compare Profit: If it's not a new minimum, calculate the potential profit and update maxProfit if it's the highest seen so far.

4. Consistency: This performs exactly n iterations with a constant amount of work per step.

**Time Complexity:** O(n) - Linear Time.
**Space Complexity:** O(1) - Constant extra space

### Second Approach

This version uses nested loops but includes logic to "jump" the index forward. It is often faster in online judges because it avoids calling max() and updating variables on every single iteration.

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        if(prices.size() < 2){
            return 0;
        }
        int res = 0;
        int min_price = 100001;
        for(int i = 0; i < prices.size(); ++i){
            if(prices[i] < min_price){
                min_price = prices[i];
                int max_price = 0;
                for(int j = i + 1; j < prices.size(); ++j){
                    if(prices[j] < min_price){
                        i = j - 1;
                        break;
                    } else if(max_price < prices[j]){
                        max_price = prices[j];
                        res = res < max_price - min_price ? max_price - min_price : res;
                    }
                }
            }
        }
        return res;
    }
};
```

1. The Floor: The outer loop waits until it finds a price lower than the current min_price.

2. The Peak Search: Once a new "floor" is found, the inner loop scans forward for the highest "peak."

3. The Skip: If the inner loop hits a price even lower than the current min_price, it breaks and sets the outer loop index i to that new location. This effectively "jumps" over sections of the array.

4. Why it's faster: It skips the res comparison logic during downward trends and avoids the overhead of the max() function call on every iteration.

**Time Complexity:** O(n) - While loops are nested, each element is visited at most twice.
**Space Complexity:** O(1) - Constant extra space
