/**
 * Created by ss on 2018/1/9.
 */

import {Utils} from "../utils/Utils.js";

function SurfaceHandler(controller) {

    var highlightColor = 255;

    var oceanMin = 0, oceanMax = 20;
    var mentionedMin = 50, mentionedMax = 100;
    var relatedMin = 100, relatedMax = 150;

    function getPickColor(mouseX, mouseY) {

        var ctx = controller.earthSurfaceShader.lookupCanvas.getContext('2d');
        ctx.clearRect(0, 0, 256, 1);

        var oceanFill = 0;
        ctx.fillStyle = 'rgb(' + oceanFill + ',' + oceanFill + ',' + oceanFill +')';
        ctx.fillRect( 0, 0, 1, 1 );

        controller.earthSurfaceShader.uniforms['outlineLevel'].value = 0;
        controller.earthSurfaceShader.uniforms['flag'].value = 0;

        controller.earthSurfaceShader.lookupTexture.needsUpdate = true;

        controller.renderer.autoClear = false;
        controller.renderer.autoClearColor = false;
        controller.renderer.autoClearDepth = false;
        controller.renderer.autoClearStencil = false;

        controller.renderer.clear();
        controller.renderer.render(controller.scene, controller.camera);

        var gl = controller.renderer.context;
        gl.preserveDrawingBuffer = true;

        var mx = ( mouseX + controller.renderer.context.canvas.width / 2 );
        var my = ( -mouseY + controller.renderer.context.canvas.height / 2 );
        mx = Math.floor(mx);
        my = Math.floor(my);

        var buf = new Uint8Array(4);
        // console.log(buf);
        gl.readPixels(mx, my, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        // console.log(buf);

        controller.renderer.autoClear = true;
        controller.renderer.autoClearColor = true;
        controller.renderer.autoClearDepth = true;
        controller.renderer.autoClearStencil = true;

        gl.preserveDrawingBuffer = false;

        controller.earthSurfaceShader.uniforms['outlineLevel'].value = 1;
        controller.earthSurfaceShader.uniforms['flag'].value = 1;

        highlightCountry(controller.selectedCountry.colorCode);

        return buf[0];
    }

    function highlightCountry(code) {
        var ctx = controller.earthSurfaceShader.lookupCanvas.getContext('2d');
        ctx.clearRect(0, 0, 256, 1);

        ctx.fillStyle = generateFillStyle(Utils.transformBrightness(controller.configure.oceanBrightness, oceanMin, oceanMax));
        ctx.fillRect( 0, 0, 1, 1 );

        if (controller.configure.isLightenMentioned) {
            ctx.fillStyle = generateFillStyle(
                Utils.transformBrightness(controller.configure.mentionedBrightness, mentionedMin, mentionedMax)
            );
            for (var i in controller.mentionedCountryCodes) {
                ctx.fillRect( controller.mentionedCountryCodes[i], 0, 1, 1 );
            }
        }

        ctx.fillStyle = generateFillStyle(
            Utils.transformBrightness(controller.configure.relatedBrightness, relatedMin, relatedMax)
        );
        for (var i in controller.relatedCountries) {

            ctx.fillRect( controller.relatedCountries[i].colorCode, 0, 1, 1 );
        }

        ctx.fillStyle = generateFillStyle(highlightColor);
        ctx.fillRect(code, 0, 1, 1);

        controller.earthSurfaceShader.lookupTexture.needsUpdate = true;
    }

    function generateFillStyle(color) {
        return 'rgb(' + color + ',' + color + ',' + color +')';
    }

    function update() {
        if (controller.earthSurfaceShader !== null) {
            controller.earthSurfaceShader.update();
        }
    }

    return {

        getPickColor: getPickColor,

        highlightCountry: highlightCountry,

        update: update
    }
}

export {SurfaceHandler}