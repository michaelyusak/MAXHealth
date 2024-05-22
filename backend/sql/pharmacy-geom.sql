\c max_health

UPDATE pharmacies SET geom = ST_SetSRID(ST_MakePoint(CAST(longitude AS float), CAST(latitude AS float)), 4326);

INSERT INTO pharmacy_couriers (pharmacy_id, courier_id)
SELECT 
    p.pharmacy_id,  c.courier_id 
FROM 
    pharmacies p 
CROSS JOIN 
    couriers c;