
      varying float vAtmosphereThickness;
      varying vec3 vLightDirection;
      varying vec3 vAtmosphereColor;
      varying vec3 vNormalEyeSpace;
  
      void main(){
  
        vec3 lightDir = normalize(vLightDirection);
        vec3 normal = normalize(vNormalEyeSpace);
  
        // computing the light intensity as it is scattered through the atmosphere
        // based on actual lighting extended a bit
        // and the thickess
        float lightIntensity = max(dot(normal, lightDir) * 1.5, -0.9);
        gl_FragColor = vec4( (vAtmosphereColor) * (0.25 + lightIntensity), vAtmosphereThickness);
      }