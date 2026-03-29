<template>
    <div class="main">
        <div class="left">Dein Verfügbares Guthaben</div>

        <div class="right">2.761,66 EUR</div>
    </div>
</template>




<style lang="scss" scoped>
.main {
    display: flex;
    padding: 13px 20px 13px 20px;
    justify-content: space-between;
    align-items: center;
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 20px 5px 5px 20px;
    background: linear-gradient(90deg, var(--secondary) 0%, var(--Strawberry) 100%);
}


.left {
    color: #fff;
    font-family: Heebo;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: .6;
    text-transform: uppercase;
}

.right {
    color: #FFF;
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: .6;
    text-transform: uppercase;
}


@media (min-width:1440px) and (max-width:1599px) {
    .left{
        font-size: 14px;
    }

    .right{
        font-size: 18px;
    }
}
</style>