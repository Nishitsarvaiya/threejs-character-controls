import { EquirectangularReflectionMapping, Texture, TextureLoader } from "three";
import { GLTFLoader, RGBELoader } from "three/examples/jsm/Addons";

/**
 *
 * @param {string} hex hex string without or without # prefix
 * @param {bool} forShaders if true, r,g,b components will be in 0..1 range
 * @returns an object with r,g,b components
 */
export const hexToRgb = (hex, forShaders = false) => {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (forShaders) {
		return result
			? {
					r: parseInt(result[1], 16) / 255,
					g: parseInt(result[2], 16) / 255,
					b: parseInt(result[3], 16) / 255,
			  }
			: null;
	}
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null;
};

/**
 * @param {string} url - Path to equirectandular .hdr
 * @returns {Promise<Texture>}
 */
export const loadHDRI = (url) => {
	return new Promise((resolve) => {
		const hdrEquirect = new RGBELoader().load(url, function () {
			hdrEquirect.mapping = EquirectangularReflectionMapping;
			resolve(hdrEquirect);
		});
	});
};

/**
 *
 * @param {string} url - Path to the texture, could be a locally imported image or a remote url
 * @returns {Promise<Texture>}
 *
 * Usage:
 * const tex = await loadTexture(ImageUrl)
 * tex.colorSpace = SRGBColorSpace
 * this.quad = new Mesh(
 *     new PlaneGeometry(),
 *     new MeshBasicMaterial({ map: tex })
 * )
 */
export const loadTexture = async (url) => {
	let textureLoader = new TextureLoader();
	return new Promise((resolve) => {
		textureLoader.load(url, (texture) => {
			resolve(texture);
		});
	});
};

/**
 *
 * @param {string} url - Path to locally imported glb or remote url
 * @returns {Promise<Object>}
 *
 * Usage:
 * let { model } = await this.loadModel(ModelUrl)
 * scene.add(model)
 */
export const loadModel = async (url) => {
	let modelLoader = new GLTFLoader();
	return new Promise((resolve) => {
		modelLoader.load(url, (gltf) => {
			const result = { model: gltf.scene };
			resolve(result);
		});
	});
};
