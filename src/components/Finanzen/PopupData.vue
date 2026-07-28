<template>
    <div class="main-popup">
        <div class="top-line-popup">
            <div class="title-popup">Rechnungsadresse EIntragen</div>
        </div>


        <div class="form-popup">
            <div class="col1-popup">
                <div class="rows">
                    <div class="row">
                        <div class="label">Firma <span>(optional)</span></div>
                        <div class="form-filed">

                        </div>

                        <img src="" class="checkmark" alt="">
                    </div>


                    <div class="row">
                        <div class="label">Vorname <span class="required">*</span></div>
                        <div class="form-filed">

                        </div>

                        <img src="" class="checkmark" alt="">
                    </div>

                    <div class="row">
                        <div class="label">E-Mail <span class="required">*</span></div>
                        <div class="form-filed">

                        </div>

                        <img src="" class="checkmark" alt="">
                    </div>

                    <div class="row">
                        <div class="label">Strasse + Hausnummer <span class="required">*</span></div>
                        <div class="form-filed">

                        </div>

                        <img src="" class="checkmark" alt="">
                    </div>
                </div>
            </div>
            <div class="col2-popup">
                <div class="rows">
                    <div class="row">
                        <div class="label">USTID <span>(optional)</span></div>
                        <div class="form-filed">

                        </div>

                        <img src="" class="checkmark" alt="">
                    </div>

                    <div class="row">
                        <div class="label">Nachname <span class="required">*</span></div>
                        <div class="form-filed">

                        </div>

                        <img src="" class="checkmark" alt="">
                    </div>

                    <div class="row">
                        <div class="label">Land <span class="required">*</span></div>
                        <div class="form-filed">

                        </div>

                        <img src="" class="checkmark" alt="">
                    </div>

                    <div class="row">
                        <div class="label">PLZ + Ort <span class="required">*</span></div>
                        <div class="form-filed">

                        </div>

                        <img src="" class="checkmark" alt="">
                    </div>
                </div>
            </div>
        </div>

        <div class="buttons-popup">
            <div class="Button-secondary" @click="$emit('close')">Abbrechen</div>
            <div class="Button-primary" @click="$emit('save')">Speichern</div>
        </div>
    </div>

</template>


<script setup>

</script>



<style lang="scss" scoped>
.main-popup {
    display: flex;
    width: 730px;
    padding: 52px 32px 40px 32px;
    flex-direction: column;
    align-items: flex-end;
    gap: 24px;

    border-radius: 20px;
    background: var(--Main-Colors-Slate, #26282D);
}

.top-line-popup {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
}


.title-popup {
    color: var(--Main-Colors-White, #FFF);
    text-align: center;
    font-family: Heebo;
    font-size: 28px;
    font-style: normal;
    font-weight: 700;
    line-height: .9;
    text-transform: uppercase;
    flex: 1 0 0;
}



.form-popup {

    display: flex;
    padding: 32px 0;
    align-items: flex-start;
    gap: 24px;
    align-self: stretch;
}


.col1-popup,
.col2-popup {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 32px;
    flex: 1 0 0;
}


.rows {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    align-self: stretch;

    .label {
        display: flex;
        align-items: flex-start;
        gap: 2px;
        color: var(--Main-Colors-Dove, #6A6C6D);
        font-family: Heebo;
        font-size: 14px;
        font-style: normal;
        font-weight: 300;
        line-height: .9;
        text-transform: uppercase;


        span {
            color: var(--Main-Colors-Dove, #6A6C6D);

            font-family: Heebo;
            font-size: 14px;
            font-style: normal;
            font-weight: 300;
            line-height: .9;
        }
    }
}



.form-filed {
    display: flex;
    padding: 8px 12px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    border-radius: 5px;
    background: var(--Main-Colors-Slate-Dark, #1B1C20);
}

.label .required {
    color: var(--Main-Colors-Strawberry, #D15);
    font-feature-settings: 'sups' on;
    font-family: Heebo;
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    line-height: .9;
    text-transform: uppercase;
}


.buttons-popup {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    align-self: stretch;
}

.Button-primary {
    display: flex;
    width: 160px;
    padding: 12px 20px 13px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 5px;
    background: var(--Main-Colors-Slate-Light, #3A3E42);


    color: var(--Main-Colors-White, #FFF);

    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    text-transform: uppercase;
}


.buttons-popup .Button-secondary.disabled {
    display: flex;
    width: 160px;
    padding: 12px 20px 13px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 5px;
    background: var(--Main-Colors-Slate-Light, #3A3E42);



    color: var(--Main-Colors-Dove, #6A6C6D);
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    text-transform: uppercase;
}
</style>