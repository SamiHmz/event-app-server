insert into utilisateur(id,nom,prenom,numero,email,password,photo,"isAdmin") values(1,'sami','hamaizi','0792944731','gs_hamaizi@esi.dz','22355','fefefe',true);

insert into type_initiateur(id,designation) values('1','club');
insert into type_evenement(id,designation) values('1','conference');


update evenement set etat = 'approuvé' where id = 7


insert into notification_initiateur(id,details,lien,is_viewed,initiateur_id,"createdAt","updatedAt") values(1,'this is your fitst notif','./demande',false,1,'2016-06-23','2016-06-23');
