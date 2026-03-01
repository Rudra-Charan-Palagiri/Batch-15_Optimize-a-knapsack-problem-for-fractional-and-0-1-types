from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

@app.route('/api/knapsack/solve', methods=['POST'])
def solve_knapsack():
    try:
        data = request.json
        raw_cap = data.get('capacity', 0)
        knapsack_type = data.get('type', 'ZERO_ONE')
        raw_items = data.get('items', [])
        
        try:
            capacity = math.floor(float(raw_cap))
        except (ValueError, TypeError):
            capacity = 0

        if capacity <= 0 or not raw_items or not isinstance(raw_items, list) or len(raw_items) == 0:
            return jsonify({'maxProfit': 0, 'selectedItems': []})

        items = []
        for item in raw_items:
            try:
                w = math.floor(float(item.get('weight', 0)))
            except (ValueError, TypeError):
                w = 0
                
            try:
                v = float(item.get('value', 0))
            except (ValueError, TypeError):
                v = 0
            
            items.append({'weight': w, 'value': v})

        max_profit = 0
        selected_items = []

        if knapsack_type == 'FRACTIONAL':
            sorted_items = []
            for i, item in enumerate(items):
                w = item['weight']
                v = item['value']
                ratio = (v / w) if w > 0 else 0
                sorted_items.append({
                    'index': i,
                    'weight': w,
                    'value': v,
                    'ratio': ratio
                })
            
            # Sort by ratio descending
            sorted_items.sort(key=lambda x: x['ratio'], reverse=True)

            current_weight = 0
            for item in sorted_items:
                if item['weight'] == 0:
                    max_profit += item['value']
                    selected_items.append({
                        'index': item['index'],
                        'fraction': 1.0,
                        'profit': round(item['value'], 2),
                        'weightTaken': 0
                    })
                    continue
                    
                if current_weight + item['weight'] <= capacity:
                    current_weight += item['weight']
                    max_profit += item['value']
                    selected_items.append({
                        'index': item['index'],
                        'fraction': 1.0,
                        'profit': round(item['value'], 2),
                        'weightTaken': item['weight']
                    })
                else:
                    remain = capacity - current_weight
                    fraction = remain / item['weight']
                    taken_value = item['value'] * fraction
                    max_profit += taken_value
                    selected_items.append({
                        'index': item['index'],
                        'fraction': round(fraction, 4),
                        'profit': round(taken_value, 2),
                        'weightTaken': remain
                    })
                    break
            
            selected_items.sort(key=lambda x: x['index'])

        else: # ZERO_ONE
            n = len(items)
            if capacity > 10000:
                return jsonify({'error': 'Capacity too large for 0/1 Knapsack'}), 400
                
            dp = [[0] * (capacity + 1) for _ in range(n + 1)]
            
            for i in range(1, n + 1):
                item_w = items[i-1]['weight']
                item_v = items[i-1]['value']
                for w in range(1, capacity + 1):
                    if item_w <= w and item_w > 0:
                        dp[i][w] = max(item_v + dp[i-1][w - item_w], dp[i-1][w])
                    else:
                        dp[i][w] = dp[i-1][w]
            
            max_profit = dp[n][capacity]
            
            # BACKTRACK
            res_val = max_profit
            w = capacity
            indices_taken = []
            for i in range(n, 0, -1):
                if res_val <= 0:
                    break
                if res_val != dp[i-1][w]:
                    indices_taken.append(i-1)
                    item_v = items[i-1]['value']
                    item_w = items[i-1]['weight']
                    res_val -= item_v
                    w -= item_w
            
            indices_taken.reverse()
            
            for idx in indices_taken:
                selected_items.append({
                    'index': idx,
                    'fraction': 1.0,
                    'profit': round(items[idx]['value'], 2),
                    'weightTaken': items[idx]['weight']
                })

        return jsonify({
            'maxProfit': round(max_profit, 2),
            'selectedItems': selected_items
        })

    except Exception as e:
        print(e)
        return jsonify({'error': f'Server Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(port=8080, debug=True)
