import React from "react";

function Footer() {
  return (
    <footer className="bg-[#F5F7FA] mt-16 pt-12 pb-6 border-t border-gray-200">
      <div className="max-w-7xl w-full mx-auto px-8 flex flex-col md:flex-row justify-between gap-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <img src="/images/LogoAlquilaloV1-Rosa-480x135.png" alt="Alquilalo" className="h-12 w-auto" />
          </div>
          <p className="text-gray-500 text-sm max-w-xs">
            Alquila lo que necesitas, cuando lo necesitas. Ahorra dinero, reduce el impacto ambiental y únete a la comunidad de consumo colaborativo.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-gray-700 mb-1">Enlaces Rápidos</span>
          <a href="/como-funciona" className="text-gray-500 hover:text-[#009688] text-sm">Cómo Funciona</a>
          <a href="/publicar-articulo" className="text-gray-500 hover:text-[#009688] text-sm">Publicar un Artículo</a>
          <a href="/ayuda" className="text-gray-500 hover:text-[#009688] text-sm">Centro de Ayuda</a>
          <a href="/blog" className="text-gray-500 hover:text-[#009688] text-sm">Blog</a>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-gray-700 mb-1">Legal</span>
          <a href="/terminos" className="text-gray-500 hover:text-[#009688] text-sm">Términos de Servicio</a>
          <a href="/privacidad" className="text-gray-500 hover:text-[#009688] text-sm">Política de Privacidad</a>
          <a href="/cookies" className="text-gray-500 hover:text-[#009688] text-sm">Política de Cookies</a>
        </div>
        <div>
          <span className="font-semibold text-gray-700 mb-1">Síguenos</span>
          <div className="flex gap-3 mt-2">
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><svg className="h-5 w-5 text-[#009688]" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12"/></svg></a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><svg className="h-5 w-5 text-[#009688]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.981.981-1.275 2.093-1.334 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.059 1.281.353 2.393 1.334 3.374.981.981 2.093 1.275 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.353 3.374-1.334.981-.981 1.275-2.093 1.334-3.374.059-1.28.072-1.689.072-7.612 0-5.923-.013-6.332-.072-7.612-.059-1.281-.353-2.393-1.334-3.374-.981-.981-2.093-1.275-3.374-1.334C15.668.013 15.259 0 12 0z"/></svg></a>
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><svg className="h-5 w-5 text-[#009688]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.116 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.025 10.025 0 0 0 24 4.557z"/></svg></a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl w-full mx-auto px-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <span> 2025 Alquilalo. Todos los derechos reservados. Plataforma de alquiler en Argentina.</span>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="/mapa-del-sitio" className="hover:text-[#009688]">Mapa del Sitio</a>
          <a href="/accesibilidad" className="hover:text-[#009688]">Accesibilidad</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;