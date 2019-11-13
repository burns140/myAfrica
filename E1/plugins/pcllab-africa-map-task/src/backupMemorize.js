/**
 * THIS FILE IS UNUSED. SIMPLY HERE AS A TRANSLATION OF THE MEMORIZE SCRIPT FROM PYTHON TO JS
 */


var PD = require('probability-distributions');


const TIME_SCALE = 1;
const MODEL_POWER = true;
const B = [1];
const POWER_B = 1;
const N_0 = 1;
const Q = 1;
const T = 10.0;
var alpha;
var beta;
var memorizeItemArray = [];

function max_unif(N, sum_D) {
    var x_max = N / sum_D;
    return N * Math.log(x_max) - sum_D * x_max;
}

function max_memorize(n_0, a, b, recalled, Ds, q_fixed = null, n_max = Number.POSITIVE_INFINITY, n_min = 0, verbose = true) {
    var N = Ds.length;
    var n_t = n_0;
    var log_sum = 0;
    var int_sum = 0;

    var n_ts = [];
    var m_dts = [];

    var not_warned_min = true;
    var not_warned_max = true;

    var n_correct = 0;
    var n_wrong = 0;
    var i = 0;

    var m_dt;
    for (var D of Ds) {
        if (!MODEL_POWER) {
            m_dt = Math.exp((-1 * n_t) * D);
        } else {
            m_dt = Math.pow((1 + POWER_B * D), (-1 * n_t));
        }

        n_ts.push(n_t);
        m_dts.push(m_dt);

        if (n_t < (1 * Math.pow(10, -20))) {
            int_sum += n_t * Math.pow(D, 2) / 2;
        } else {
            if (!MODEL_POWER) {
                int_sum += D + (Math.exp(-1 * n_t * D) - 1) / n_t;
            } else {
                int_sum += D - (Math.pow(1 + POWER_B * D, 1 - n_t) - 1) / (POWER_B * (1 - n_t));
            }
        }

        if (m_dt >= 1.0) {
            log_sum = Number.NEGATIVE_INFINITY;
        } else {
            log_sum += Math.log(1 + (-1 * m_dt));
        }

        if (recalled[i] == true) {
            n_t *= (1 - a);
            n_correct += 1;
        } else {
            n_t *= (1 + b);
            n_wrong += 1;
        }

        n_t = Math.min(n_max, Math.max(n_min, n_t));

        if (n_t == n_max && not_warned_max) {
            if (verbose) {
                console.warn('Max boundary hit');
            }
            not_warned_max = false;
        }

        if (n_t == n_min && not_warned_min) {
            if (verbose) {
                console.warn('Min boundary hit');
            }
            not_warned_min = false;
        }
        i++;
    }

    var q_max = 1.0;
    if (int_sum != 0) {
        if (q_fixed == null) {
            q_max = 1 / Math.pow((4 * ((N / 2) / int_sum), 2));
        } else {
            q_max = q_fixed;
        }
    } else {
        q_max = 1.0;
    }

    var LL = log_sum - (N / 2) * Math.pow(Math.log(q_max), 0.5) * int_sum;
    const m_mean = m_dts => m_dts.reduce((a, b) => a + b, 0);

    if (not_warned_min) {
        not_warned_min = false;
    } else {
        not_warned_min = true;
    }

    if (not_warned_max) {
        not_warned_max = false;
    } else {
        not_warned_max = true;
    }

    return {
        'q_max': q_max,
        'n_ts': n_ts,
        'm_dts': m_dts,
        'm_mean': m_mean,
        'log_sum': log_sum,
        'int_sum': int_sum,
        'LL': LL,
        'max_boundary_hit': not_warned_max,
        'min_boundary_hit': not_warned_min,
        'n_max': n_max,
        'n_min': n_min
    }
}

function calc_ll_arr(method, data_arr, alpha = null, beta = null, success_prob = 0.49, eps = (1 * Math.pow(10, -10)), all_mem_output = false, verbose = true) {
    //var n_0 = data_arr[0].n_0;
    var n_0 = N_0;
    var sum = 0;
    var recalled = [];
    var deltas = [];
    var op;
    if (method == 'uniform') {
        for (var del of data_arr) {
            sum += del.delta;
        }
        var sum_D = Math.max(sum, eps);
        N = data_arr.length;
        return max_unif(N, sum_D); 
    } else if (method == 'memorize') {
        for (var item of data_arr) {
            if (item.p_recall > success_prob) {
                recalled.push(item);
            }
            if (item.delta <= 0) {
                deltas.push(eps);
            } else {
                deltas.push(item.delta);
            }
        }
        op = max_memorize(n_0, alpha, beta, recalled, deltas, verbose = verbose);
        if (!all_mem_output) {
            return op.LL;
        } else {
            return op;
        }
    } else {
        throw 'Invalid format';
    }
}

function max_threshold(n_0, a, b, recalled, Ds, w, p, alpha_fixed = null, n_max = Number.POSITIVE_INFINITY, n_min = 0, verbose = true) {
    var N = Ds.length;
    var n_t = n_0;
    var log_sum = 0;
    var int_sum = 0;
    var n_ts = [];
    var m_dts = [];
    var tau_dts = [];
    var not_warned_min = true;
    var not_warned_max = true;
    var n_correct = 0;
    var n_wrong = 0;
    var sum_third = 0;
    var sum_second = 0;
    var tau;
    var D_;

    var i = 0;

    for (var D of Ds) {
        if (MODEL_POWER == true) {
            tau = (Math.exp((-1 * Math.log(p) / n_t) - 1) / B[0]);
        } else {
            tau = -1 * Math.log(p) / n_t;
        }


        // If the D_ lines don't work, remove the brackets
        if (n_t < (1 * Math.pow(10, -20)) && p != 1.0) {
            throw 'P should be 1 when n_t is not infinite';
        } else if (n_t < (1 * Math.pow(10, -20)) && p == 1.0) {
            D_ = Math.max([D, 0.0001]);
        } else {
            D_ = Math.max([D - tau, 0.0001])
        }

        sum_third += w * (Math.exp((-1 * D_) / w) - 1);
        sum_second += (-1 * D_) / w;

        n_ts.push(n_t);
        m_dts.push(Math.exp((-1 * n_t) * D));
        tau_dts.push(tau);

        if (recalled[i] == true) {
            n_t *= a;
            n_correct += 1;
        } else {
            n_t *= b;
            n_wrong += 1;
        }

        n_t = Math.min(n_max, Math.max(n_min, n_t));

        if (n_t == n_max && not_warned_max) {
            if (verbose) {
                console.warn('Min boundary hit');
            }
            not_warned_min = false;
        }
        i++;
    }

    var alpha_max;
    if (alpha_fixed == null) {
        alpha_max = (-1 * N) / sum_third;
    } else {
        alpha_max = alpha_fixed;
    }

    var LL = N * Math.log(Math.max([alpha_max, 0.0001])) + sum_second + alpha_max * sum_third;
    if (!isFinite(LL)) {
        throw 'LL is not finite';
    }

    if (not_warned_max) {
        not_warned_max = false;
    } else {
        not_warned_max = true;
    }

    if (not_warned_min) {
        not_warned_min = false;
    } else {
        not_warned_min = true;
    }
    return {
        'alpha_max': alpha_max,
        'n_ts': n_ts,
        'm_dts': m_dts,
        'm_mean': np.mean(m_dts),
        'log_sum': log_sum,
        'int_sum': int_sum,
        'LL': LL,
        'max_boundary_hit': not_warned_max,
        'min_boundary_hit': not_warned_min,
        'n_max': n_max,
        'n_min': n_min,
        'p': p,
        'w': w,
        'sum_second': sum_second,
        'sum_third': sum_third,
        'N': N
    }
}

function calc_ll_arr_thres(
    method, data_arr, alpha = null, beta = null, success_prob = 0.49, eps = Math.pow(10, -10),
    w_range = null, p_range = null, verbose = true, all_thres_output = true, alpha_fixed = null
) {
    if (method != 'threshold') {
        throw 'This function only computes the max_threshold LL'
    }

    var recalled = [];
    var deltas = [];
    var n_0 = data_arr[0].n_0;
    var best_LL = null;

    for (var el of data_arr) {
        if (el.p_recall > success_prob) {
            recalled.push(el);
        }
        if (el.delta <= 0) {
            deltas.push(eps);
        } else {
            deltas.push(el.delta);
        }
    }

    if (w_range == null) {
        w_range = [0.01, 0.1, 1, 10, 100];
    }

    var n_is = [n_0];

    for (var el of data_arr) {
        if (el.p_recall > success_prob) {
            n_is.push(n_is[n_is.length - 1] * alpha);
        } else {
            n_is.push(n_is[n_is.length - 1] * beta)
        }
    }

    n_is.pop();
    var sum_n_is = 0;
    for (var el of n_is) {
        if (el < (1 * Math.pow(10, -20))) {
            sum_n_is += 1;
        }
    }

    if (p_range == null) {
        if (sum_n_is > 0) {
            p_range = [1.0];
        } else {
            var vals = [];
            for (var i = 0; i < deltas.length; i++) {
                vals.push((-1 * deltas[i]) * n_is[i]);
            }
            p_ = Math.max(vals);
            p_range = unique(linspace(p_, 1, 4));
        }
    }

    for (var w of w_range) {
        for (var p of p_range) {
            var op = max_threshold(n_0, a = alpha, b = beta, recalled = recalled, Ds = deltas, p = p, w = w, verbose = verbose, alpha_fixed = alpha_fixed);
            
        }
    }

    // TODO: FINISH 
}

function linspace(start, stop, num) {
    var arr = [];
    var step = (stop - start) / (num - 1);
    for (var i = 0; i < num; i++) {
        arr.push(start + (step * i));
    }
    return arr;
}

function unique(duplicates) {
    var arr = [];
    for (var i = 0; i < duplicates.length; i++) {
        if (!arr.includes(duplicates[i])) {
            arr.push(duplicates[i]);
        }
    }

    return arr;
}


/*function calc_empirical_forgetting_rate(memorizeItemArray, return_base = false, no_norm = false) {
    res = ((-1 * Math.log(Math.max(0.01, Math.min(0.99, Math.pow(10, -10))))) / 0.1)
}*/

function calcForgettingRate(item) {
    if (item.accuracy == 1) {
        return (1 - alpha) * item.forgettingRate;
    } else if (item.accuracy == 0) {
        return (1 + beta) * item.forgettingRate;
    } else {
        throw 'Accuracy wasn\'t one or zero';
    }
}

function calcRecallProb(item) {
    return Math.exp(-1 * item.forgettingRate * item.sinceLastSeen);
}

function calcReviewingIntensity(item) {
    return Math.pow(Q, -0.5) * (1 - item.p_recall);
}

/**
 * Get a sample from the necessary distribution
 * @param {*} n_t 
 * @param {*} q 
 * @param {*} T 
 */
function sampler(n_t, q, T) {
    var t = 0;
    while (true) {
        var max_int = 1.0 / Math.sqrt(q);
        var t_ = PD.rexp(1, max_int)[0];        // Get a value randomly sampled from exponential distribution          
        if ((t_ + t) > T) {
            return;
        }
        t = t + t_;
        var proposed_int = intensity(t, n_t, q);    // Calculate the forgetting intensity
        if (PD.rint(1, 0, 1)[0] < (proposed_int / max_int)) {       //Get a value sampled from a uniform distribution
            return t;
        }
    }
}

function on_trial_finish(item) {
    item.forgettingRate = calcForgettingRate(item);
    item.p_recall = calcRecallProb(item);
    item.reviewingItensity = calcReviewingIntensity(item);
    item.priority = sampler(forgettingRate, Q, T);
    return item;
}

function MemorizeItem(key) {
    this.forgettingRate = null;
    this.countryName = key;
    this.delta = 0;
    this.p_recall = Math.pow(10, -10);
    this.n_t = N_0;
    this.sinceLastSeen = 0;
    this.accuracy = -1;
    this.reviewingItensity = -1;
    this.priority = 0;
}

function createMemorizeItems(allCountries) {
    for (var key in allCountries) {
        memorizeItemArray.push(new MemorizeItem(key));
    }

    alpha = -1 * (Math.pow(2, (-1 * RIGHT))) + 1;
    beta = (Math.pow(2,  (-1 * WRONG)) - 1);
    return memorizeItemArray;
}

