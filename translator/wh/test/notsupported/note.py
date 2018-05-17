"""
BARSBK 上一次买开信号位置

用法：
BARSBK返回上一次买开仓的K线距离当前K线的周期数（不包含出现BK信号的那根K线）
取包含BK信号出现的那根K线到当前K线的周期数，则需要在此函数后+1，即BARSBK+1；
由于发出BK信号的当根k线BARSBK返回空值，则BARSBK+1在发出BK信号当根k线返回空值。

注：
1、若当前K线之前无BK信号，则函数返回值为空值
2、BK信号固定后BARSBK返回为空值。
（1）设置信号执行方式为K线走完确认信号下单
BARSBK返回值为上一个BK信号距离当前的K线根数（包含当前K线）
（2）设置信号执行方式为出信号立即下单，不复核（例如：在模型中写入MULTSIG或MULTSIG_MIN;）
    a.历史信号计算中，出现BK信号的当根K线，BARSBK返回空值
    b.加载运行过程中,信号固定后BARSBK返回空值
（3）设置信号执行方式为K线走完复核（例如：在模型中写入CHECKSIG(BK,'A',N,'D',0,0);）
BARSBK返回值为上一个BK信号距离当前的K线根数（包含当前K线）

例：
1、BARSBK>10,SP;//上一次买开仓（不包含出现买开信号的那根K线）距离当前K线的周期数大于10，卖平；
2、HHV(H,BARSBK+1);//上一次买开仓（包含开仓信号出现的当根k线）到当前的最高价的最大值。
当根K线出现BK信号，AA返回为空值，需要返回当根K线上最高价，模型需要修改为:
AA:IFELSE(BARSBK>=1,HHV(H,BARSBK+1),H);
（1）当根K线出现BK信号，BARSBK返回为空值，不满足BARSBK>=1的条件，则取值为当根K线的最高价H
（2）发出BK信号之后K线BARSBK返回买开仓的K线距离当前K线的周期数，满足BARSBK>=1的条件，则取值为HHV(H,BARSBK+1)，即买开仓（包含开仓信号出现的当根k线）到当前的最高价的最大值。
修改后如果平仓条件中用到了AA的值，当根K线满足了平仓条件，可以出现平仓信号 
3、AA:IFELSE(BARSBK>=1,REF(C,BARSBK),C);//取最近一次买开仓K线的收盘价
（1）发出BK信号的当根k线BARSBK返回空值,则当根K线不满足BARSBK>=1的条件，AA返回当根k线的收盘价；
（2）发出BK信号之后的k线BARSBK返回买开仓的K线距离当前K线的周期数，则AA返回REF(C,BARSBK)，即开仓k线的收盘价；
（3）例：1、2、3三根k线，1 K线为开仓信号的当根k线，则返回当根k线的收盘价，2、3 K线AA返回值为 1 K线的收盘价。
"""

"""
BARSBK 上一次买开信号位置
BARSBP 上一次买平信号位置

BARSSK 上一次卖开信号位置
BARSSP 上一次卖平信号位置

差别：

文华：4种信号
天勤：2种信号 BUY SELL

文华：信号 === 买卖
天勤：信号 != 买卖

BKVOL  返回模型当前的多头理论持仓。

ISLASTBK ISLASTBP ISLASTBPK => IS_LAST_BUY(i)
ISLASTSK ISLASTSP ISLASTSPK => IS_LAST_SELL(i)


"""

