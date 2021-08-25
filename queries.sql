insert into utilisateur(id,nom,prenom,numero,email,password,photo,"isAdmin") values(1,'sami','hamaizi','0792944731','gs_hamaizi@esi.dz','22355','fefefe',true);

insert into type_initiateur(id,designation) values('1','club');
insert into type_evenement(id,designation) values('1','conference');


update evenement set etat = 'approuvé' where id = 7


insert into notification_initiateur(id,details,lien,is_viewed,initiateur_id,"createdAt","updatedAt") values(1,'this is your fitst notif','./demande',false,1,'2016-06-23','2016-06-23');


/* nb evenement cette anneé */ 

select count(id) from evenement e where e.initiateur_id = user.id  and e.is_happened=true;

/* sponsoring moneny */
select  sum(montant) from evenement e join sponsoring s 
on  e.id = s.evenement_id 
where e.is_happened = true ;
and s.etat = 'approuvé'; 


/* intervenant      */
SELECT i.type,i.etat,COUNT(i.id) FROM intervenant i JOIN evenement e
 ON e.id = i.evenement_id
 WHERE e.initiateur_id = 1 
 GROUP BY i.type,i.etat;

 AND i.etat = 'approuvé' 
 /* nb interne */
 SELECT SUM(b.participants_intern) ,SUM(b.participants_extern) FROM  evenement e JOIN bilan b 
 ON e.id = b.evenement_id 
 WHERE b.etat = 'approuvé' 
 AND e.id = 1 ;

 /*    nb demande rejeteé      */

 SELECT COUNT(e.id) FROM evenement e JOIN initiateur i 
 ON i.id = e.initiateur_id 
 WHERE i.id = 1
 AND e.etat = 'rejetè';

/* nb evenement par type */

 SELECT e.type, COUNT(e.id) FROM evenement e JOIN initiateur i 
 ON i.id = e.initiateur_id 
 WHERE i.id =  1 
 AND e.is_happened = true
 GROUP BY e.type ;

 /*********************Administration simple************************/


 SELECT  etat,count(etat) FROM evenement e 
 GROUP BY etat ;


 /* evenement par initiateur */ 

 SELECT i.nom,count(e.is_happened) FROM evenement e RIGHT JOIN initiateur i 
 ON e.initiateur_id = i.id 
 WHERE e.is_happened = true or is_happened IS NULL
 GROUP BY i.nom ;

    SELECT i.nom ,SUM(s.montant) FROM evenement e RIGHT JOIN initiateur i 
    ON e.initiateur_id = i.id 
    LEFT JOIN sponsoring s 
    ON s.evenement_id = e.id 
 WHERE e.is_happened = true or is_happened IS NULL
    GROUP BY i.nom;


