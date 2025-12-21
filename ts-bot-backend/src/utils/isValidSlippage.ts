export function isValidSlippage(slippage: string) {

    const slippage_ = parseFloat(slippage);

    if(isNaN(slippage_) || (slippage_) < 0 || (slippage_) > 100) {

        return false;
    }

    return true;

}