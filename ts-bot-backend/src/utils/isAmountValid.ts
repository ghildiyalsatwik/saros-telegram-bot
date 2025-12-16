export function isAmountValid(amount: string) {

    const amount_ = parseFloat(amount);

    if(isNaN(amount_) || amount_ <= 0) {

        return false;
    }

    return true;
}