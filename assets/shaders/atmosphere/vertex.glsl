
uniform vec3 earthCenter;
uniform float earthRadius;
uniform float atmosphereRadius;
uniform vec3 lightDirection;

varying float atmosphereThickness;
varying vec3 vLightDirection;
varying vec3 vNormalEyeSpace;


void main(){

    // 1. compute the position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);


    // 2. compute the thinckness of the atmosphere
    // for this, we intersect the vector (eye - current vertex) with the atmosphere and the earth
    // and we compute how long this line is. In pixel shader we compute the light scattering based on this measure
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection

    vec3 positionW = (modelMatrix * vec4(position, 1.0)).xyz;

    vec3 vCameraEarth = cameraPosition.xyz - earthCenter;
    vec3 vCameraVertex = normalize(cameraPosition.xyz - positionW);

    float tca = dot(vCameraEarth, vCameraVertex);

    if (tca < 0.0) {
        // not intesect, looking in opposite direction
        atmosphereThickness = 0.0;
        return;
    }

    float dsq = dot(vCameraEarth, vCameraEarth) - tca * tca;
    float thc_sq_atmosphere = max(atmosphereRadius * atmosphereRadius - dsq, 0.0);
    float thc_sq_earth = max(earthRadius * earthRadius - dsq, 0.0);

    float thc_atmosphere = 2.0 * sqrt(thc_sq_atmosphere);
    float thc_earth = 2.0 * sqrt(max(0.0, thc_sq_earth));

    float thc = (thc_atmosphere - thc_earth) * 0.03; // 0.01 - density factor
    atmosphereThickness = thc;

    // 3. the normal light calculation
    vLightDirection = mat3(viewMatrix) * lightDirection;
    vNormalEyeSpace = normalize(normalMatrix * normal);

}

