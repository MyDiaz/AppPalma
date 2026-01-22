-- Estas queries se ejecutaron en la base SIGPA3 que esta local
-- en el PC de Ale para replicar el esquema que existe hoy en
-- en la base que está en simon y aparentemente funciona.

-- Dejo documentado por si es necesario deshacer los cambios
-- luego.

--
ALTER TABLE IF EXISTS public."CENSO_PRODUCTIVO"
    ADD COLUMN cc_usuario character varying COLLATE pg_catalog."default";

UPDATE public."CENSO_PRODUCTIVO" SET cc_usuario = 1098765432;

ALTER TABLE public."CENSO_PRODUCTIVO"
    ALTER COLUMN cc_usuario SET NOT NULL;


ALTER TABLE IF EXISTS public."CENSO_PRODUCTIVO"
    ADD CONSTRAINT fk_cc_usuario FOREIGN KEY (cc_usuario)
    REFERENCES public."USUARIO" (cc_usuario) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

--
ALTER TABLE IF EXISTS public."REGISTRO_ENFERMEDAD" DROP CONSTRAINT IF EXISTS nombre_enfermedad;

ALTER TABLE IF EXISTS public."REGISTRO_ENFERMEDAD"
    ADD CONSTRAINT nombre_enfermedad FOREIGN KEY (nombre_enfermedad)
    REFERENCES public."ENFERMEDAD" (nombre_enfermedad) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE NO ACTION
    NOT VALID;

--
ALTER TABLE IF EXISTS public."COSECHA" DROP CONSTRAINT IF EXISTS "COSECHA_id_viaje_fkey";

ALTER TABLE IF EXISTS public."COSECHA"
    ADD CONSTRAINT "COSECHA_id_viaje_fkey" FOREIGN KEY (id_viaje)
    REFERENCES public."VIAJE" (id_viaje) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;