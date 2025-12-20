export function isValidUpperBin(lower: string) {

    const lower_ = parseInt(lower);

    if(isNaN(lower_) || lower_ < 0) {

        return false;
    }

    return true;
}