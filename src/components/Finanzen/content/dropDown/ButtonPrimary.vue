<template>
    <router-link to="/auszahlung" class="main">
            <div class="p">
            Guthaben auszahlen
            </div>
    </router-link>
</template>



<style lang="scss" scoped>
.main {
    display: flex;
    width: 220px;
    padding: 12px 20px 13px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    align-self: stretch;
    border-radius: 5px;
    background: #D15;

    &:hover{
        background: var(--dark-red);
    }
}

.p {
    color: #FFF;
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: .6;
    text-transform: uppercase;
}


@media (min-width:1440px) and (max-width:1599px) {
    .main{
       display: flex;
width: 160px;
padding: 12px 9px 13px 9px;
justify-content: center;
align-items: center;
gap: 10px;
align-self: stretch;
border-radius: 5px;
background: var(--Main-Colors-Strawberry, #D15);
flex-wrap: nowrap;
        
    }
    .p{
       color: var(--Main-Colors-White, #FFF);

font-family: Heebo;
font-size: 12px;
font-style: normal;
font-weight: 400;
line-height: normal;
text-transform: uppercase;
    }
}
</style>