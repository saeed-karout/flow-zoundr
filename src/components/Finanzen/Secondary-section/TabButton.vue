```vue
<template>
    <div class="tab-btn" :class="{ active: isActive }" @click="$emit('set-active', tabName)">
        <div class="left-corner">
            <div class="rectangle3" v-if="tabName === 'Songs'">
                <div class="rectangle2"></div>
            </div>
            <template v-else>
                <div class="rectangle3"></div>
                <div class="rectangle2"></div>
            </template>
        </div>
        <div class="Button-tab">{{ tabName }}</div>
        <div class="right-corner">
            <div class="rectangle3" v-if="tabName === 'Songs'">
                <div class="rectangle2"></div>
            </div>
            <template v-else>
                <div class="rectangle3"></div>
                <div class="rectangle2"></div>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        tabName: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: false
        }
    }
};
</script>


<style lang="scss" scoped>

.section-secondary {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
    align-self: stretch;
}

.Tab-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 0 0;
}

.Tab-content .Tabs {
    display: flex;
    align-items: flex-start;
    gap: -40px;
}

.Tabs .tab-btn {
    display: flex;
    height: 66px;
    justify-content: center;
    align-items: flex-end;
    position: relative;
    cursor: pointer;
    // transition: all 0.3s ease;
}

.tab-btn .Button-tab {
    display: flex;
    padding: 26px 37.5px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 20px 20px 0px 0px;
    background: rgba(38, 40, 45, 0.00);
    color: var(--selvar);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    text-transform: uppercase;
    position: relative;
    // transition: background 0.3s ease;
    z-index: 11;
}

.tab-btn:hover .Button-tab {
    background: var(--secondary);
    color: white;
}

.tab-btn .Button-tab:hover,.tab-btn.tab-btn.active{
    position: relative;
    color: white;
     &::after{
        content: '';
        position: absolute;
        width: 100%;
        height: 20px;
        background: var(--secondary);
        bottom: -18px;
    }
}

.tab-btn.active .Button-tab {
    background: var(--secondary);
    position: relative;
    color: #fff;
}

/* Hide corner elements by default */
.tab-btn .left-corner,
.tab-btn .right-corner {
    display: none;
    opacity: 0;
    // transition: opacity 0.3s ease;
}

/* Show corner elements for active tab or on hover */
.tab-btn.active .left-corner,
.tab-btn.active .right-corner,
.tab-btn:hover .left-corner,
.tab-btn:hover .right-corner {
    display: block;
    opacity: 1;
    width: 20px;
    height: 20px;
    fill: var(--Main-Colors-Slate, #26282D);
    position: absolute;
    bottom: 0;
}

.tab-btn.active .left-corner,
.tab-btn:hover .left-corner {
    left: -20px;
}

.tab-btn.active .right-corner,
.tab-btn:hover .right-corner {
    right: -20px;
}

.right-corner .rectangle3 {
    width: 20px;
    height: 20px;
    background: var(--Main-Colors-Slate, #26282D);
    position: relative;
    // transition: background 0.3s ease;
}

.right-corner .rectangle2 {
    width: 20px;
    height: 20px;
    border-radius: 0px 0px 0px 20px;
    background: var(--primary);
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 2;
    // transition: background 0.3s ease;
}

.left-corner .rectangle3 {
    width: 20px;
    height: 20px;
    background: var(--Main-Colors-Slate, #26282D);
    position: relative;
    // transition: background 0.3s ease;
}

.left-corner .rectangle2 {
    width: 20px;
    height: 20px;
    background: var(--primary);
    border-radius: 0 0 20px 0;
    position: absolute;
    top: 0px;
    left: 0;
    z-index: 2;
    // transition: background 0.3s ease;
}

/* Handle Services tab's nested structure */
.tab-btn .left-corner .rectangle3 .rectangle2,
.tab-btn .right-corner .rectangle3 .rectangle2 {
    width: 20px;
    height: 20px;
    background: var(--primary);
    position: absolute;
    top: 0;
    z-index: 2;
    // transition: background 0.3s ease;
}

.tab-btn .left-corner .rectangle3 .rectangle2 {
    border-radius: 0 0 20px 0;
    left: 0;
}

.tab-btn .right-corner .rectangle3 .rectangle2 {
    border-radius: 0 0 0 20px;
    right: 0;
}

/* Ensure active tab's corners have default backgrounds */
.tab-btn.active .left-corner .rectangle3,
.tab-btn.active .right-corner .rectangle3 {
    background: var(--Main-Colors-Slate, #26282D);
}

.tab-btn.active .left-corner .rectangle2,
.tab-btn.active .right-corner .rectangle2,
.tab-btn.active .left-corner .rectangle3 .rectangle2,
.tab-btn.active .right-corner .rectangle3 .rectangle2 {
    background: var(--primary);
}

/* When hovering the tab to the left of the active tab */
.tab-btn:hover+.tab-btn.active .left-corner .rectangle2,
.tab-btn:hover+.tab-btn.active .left-corner .rectangle3 .rectangle2 {
    background: var(--secondary);
}

/* When hovering the tab to the right of the active tab */
.tab-btn.active+.tab-btn:hover .left-corner .rectangle2,
.tab-btn.active+.tab-btn:hover .left-corner .rectangle3 .rectangle2 {
    background: var(--secondary);
}

.tab-btn.active .right-corner .rectangle2,
.tab-btn.active .right-corner .rectangle3 .rectangle2 {
    background: var(--primary);
}

/* Ensure non-shared corners retain default background during hover */
.tab-btn:hover .left-corner .rectangle2,
.tab-btn:hover .left-corner .rectangle3 .rectangle2,
.tab-btn.active+.tab-btn:hover .right-corner .rectangle2,
.tab-btn:hover+.tab-btn.active .right-corner .rectangle2,
.tab-btn:hover+.tab-btn.active .right-corner .rectangle3 .rectangle2,
.tab-btn.active .left-corner .rectangle2,
.tab-btn.active .left-corner .rectangle3 .rectangle2 {
    background: var(--primary);
}

/* Ensure active tab's right-corner .rectangle3 is not overridden by hover */
.tab-btn.active .right-corner .rectangle3:not(.tab-btn:hover + .tab-btn.active .right-corner .rectangle3) {
    background: var(--secondary);
}

.Content-Box {
    display: flex;
    padding: 20px;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 20px;
    background: var(--secondary);
}

.Content-Box .column1 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
}
</style>
```